
from collections import defaultdict

import pandas as pd


class Popular:
    

    def __init__(self, by="buyers", window_days=None):
        self.by = by
        self.window_days = window_days
        self.name = f"popular_{by}" + (f"_{window_days}d" if window_days else "")

    def fit(self, train):
        df = train
        if self.window_days:
            start = df["order_date"].max() - pd.Timedelta(days=self.window_days)
            df = df[df["order_date"] >= start]
        if self.by == "buyers":
            counts = df.drop_duplicates(["user_id", "product_id"]).groupby("product_id").size()
            label = "bought by {n} villagers on the island"
        else:
            counts = df.groupby("product_id")["quantity"].sum()
            label = "bought {n} times on the island"
        counts = counts.sort_values(ascending=False, kind="stable")
        self._ranking = [(p, label.format(n=int(n))) for p, n in counts.items()]
        return self

    def rank(self, user_id):
        return self._ranking


class Usual:

    def __init__(self, last_orders=None, half_life=None):
        self.last_orders = last_orders
        self.half_life = half_life
        self.name = "usual"
        if last_orders:
            self.name += f"_last{last_orders}"
        if half_life:
            self.name += f"_decay{half_life}"

    def fit(self, train):
        baskets = (
            train.sort_values(["user_id", "order_number"])
            .groupby(["user_id", "order_number"], sort=False)["product_id"]
            .agg(list)
        )
        history = defaultdict(list)
        for (user_id, _), products in baskets.items():
            history[user_id].append(products)
        self._history = dict(history)
        return self

    def rank(self, user_id):
        orders = self._history.get(user_id, [])
        if self.last_orders:
            orders = orders[-self.last_orders:]
        n = len(orders)
        if n == 0:
            return []  
        score = defaultdict(float)
        count = defaultdict(int)
        for i, basket in enumerate(orders):
            weight = 0.5 ** ((n - 1 - i) / self.half_life) if self.half_life else 1.0
            for product_id in set(basket):
                score[product_id] += weight
                count[product_id] += 1
        scope = f"last {n}" if self.last_orders and n == self.last_orders else f"{n}"
        ranked = sorted(score, key=lambda p: (-score[p], p))
        return [(p, f"in {count[p]} of your {scope} orders") for p in ranked]