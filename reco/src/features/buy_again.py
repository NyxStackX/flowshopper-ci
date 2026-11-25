import numpy as np
from collections import defaultdict

from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

HALF_LIFE = 5  

RELATION_FEATURES = [
    "n_orders",        
    "count",           
    "frac",            
    "frac5",           
    "frac10",          
    "since_last",      
    "days_since_last", 
    "gap_mean",        
    "overdue",         
    "decay",           
    "basket_avg5",     
]


def make_estimator(name, seed=0):
    if name == "logreg":
        return make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    if name == "rf":
        return RandomForestClassifier(n_estimators=100, max_depth=12, min_samples_leaf=20,
                                      n_jobs=-1, random_state=seed)
    if name == "hgb":
        return HistGradientBoostingClassifier(max_iter=200, learning_rate=0.1, max_depth=6,
                                              random_state=seed)
    raise ValueError(f"unknown estimator: {name}")


def features_at(B, dates, k):
    H = B[:k]
    count = H.sum(axis=0)
    cand = np.flatnonzero(count > 0)
    H, count = H[:, cand], count[cand].astype(float)

    since_last = H[::-1].argmax(axis=0).astype(float)
    last_idx = (k - 1 - since_last).astype(int)
    days_since_last = (dates[k - 1] - dates[last_idx]) / np.timedelta64(1, "D")
    gap_mean = k / count
    weights = 0.5 ** (np.arange(k)[::-1] / HALF_LIFE)
    n5, n10 = min(5, k), min(10, k)

    cols = [
        np.full(len(cand), k, dtype=float),
        count,
        count / k,
        H[k - n5:].sum(axis=0) / n5,
        H[k - n10:].sum(axis=0) / n10,
        since_last,
        days_since_last.astype(float),
        gap_mean,
        (since_last + 1) / gap_mean,
        (H * weights[:, None]).sum(axis=0),
        np.full(len(cand), B[k - n5:k].sum(axis=1).mean()),
    ]
    return cand, np.column_stack(cols)


def _histories(train):
    """villager -> (dates, 0/1 order x product matrix, product ids), orders sorted oldest first."""
    baskets = (
        train.sort_values(["user_id", "order_number"])
        .groupby(["user_id", "order_number"], sort=False)
        .agg(date=("order_date", "first"), products=("product_id", list))
        .reset_index()
    )
    out = {}
    for user_id, g in baskets.groupby("user_id", sort=False):
        products = sorted({p for basket in g["products"] for p in basket})
        index = {p: i for i, p in enumerate(products)}
        B = np.zeros((len(g), len(products)), dtype=np.int8)
        for row, basket in enumerate(g["products"]):
            for p in basket:
                B[row, index[p]] = 1
        out[user_id] = (g["date"].values.astype("datetime64[D]"), B, np.array(products))
    return out


class BuyAgain:
    """Buy it again: estimator in {"logreg", "rf", "hgb"}."""

    def __init__(self, estimator="hgb", n_targets=8, min_proba=0.0, seed=0):
        self.estimator = estimator
        self.n_targets = n_targets
        self.min_proba = min_proba
        self.seed = seed
        self.name = f"buy_again_{estimator}"

    def _static_features(self, catalog):
        self._categories = sorted(catalog["category"].unique())
        self._static = {}
        for pid, price, cat in zip(catalog["id"], catalog["price_bells"], catalog["category"]):
            onehot = [1.0 if cat == c else 0.0 for c in self._categories]
            self._static[pid] = [float(np.log1p(price))] + onehot

    def _static_matrix(self, products, cand):
        return np.array([self._static[p] for p in products[cand]])

    def fit(self, train, catalog):
        self._static_features(catalog)
        histories = _histories(train)
        X_parts, y_parts = [], []
        for dates, B, products in histories.values():
            n = B.shape[0]
            for k in range(max(1, n - self.n_targets), n):
                cand, X = features_at(B, dates, k)
                X_parts.append(np.hstack([X, self._static_matrix(products, cand)]))
                y_parts.append(B[k, cand])
        X, y = np.vstack(X_parts), np.concatenate(y_parts)
        self.n_samples, self.positive_rate = len(y), float(y.mean())
        self.model = make_estimator(self.estimator, self.seed).fit(X, y)

        self._scored = {}
        for user_id, (dates, B, products) in histories.items():
            n = B.shape[0]
            cand, X = features_at(B, dates, n)
            proba = self.model.predict_proba(
                np.hstack([X, self._static_matrix(products, cand)]))[:, 1]
            order = np.argsort(-proba, kind="stable")
            self._scored[user_id] = [
                (products[cand[i]], float(proba[i]), self._reason(X[i], n)) for i in order
            ]
        return self

    @staticmethod
    def _reason(x, n):
        f = dict(zip(RELATION_FEATURES, x))
        m = min(10, n)
        count10 = int(round(f["frac10"] * m))
        if f["overdue"] >= 1 and f["frac10"] < 0.5 and f["gap_mean"] >= 2:
            return (f"you buy it about every {f['gap_mean']:.0f} orders, "
                    f"and your last one was {int(f['since_last']) + 1} orders ago")
        return f"you bought it in {count10} of your last {m} orders"

    def scored(self, user_id):
        """[(product_id, probability, reason)] best first, before any threshold."""
        return self._scored.get(user_id, [])

    def rank(self, user_id):
        """[(product_id, reason)] best first; nothing under min_proba, nothing without history."""
        return [(p, reason) for p, proba, reason in self.scored(user_id)
                if proba >= self.min_proba]