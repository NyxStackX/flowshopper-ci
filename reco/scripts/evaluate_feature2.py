import sys
import time
from pathlib import Path

import numpy as np
from sklearn.metrics import average_precision_score, roc_auc_score

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data import (catalog_allergens, declared_allergens, load_catalog, load_orders,
                      load_users)
from src.evaluation import CUTOFF, K, evaluate, temporal_split
from src.features.buy_again import BuyAgain
from src.features.popular_usual import Usual


def classification_scores(model, targets, users):
    y, p = [], []
    for user_id in users:
        for product_id, proba, _ in model.scored(user_id):
            y.append(product_id in targets[user_id])
            p.append(proba)
    y = np.array(y)
    return average_precision_score(y, p), roc_auc_score(y, p), y.mean()


def row(name, r, extra=""):
    return (f"| {name} | {r['precision']:.3f} | {r['recall']:.3f} | {r['ndcg']:.3f} | "
            f"{r['hit_rate']:.3f} | {r['avg_recommended']:.2f} |{extra}")


def main():
    catalog, orders, users = load_catalog(), load_orders(), load_users()
    cat_all, declared = catalog_allergens(catalog), declared_allergens(users)
    train, targets = temporal_split(orders)
    warm = [u for u in sorted(set(train["user_id"])) if u in targets]
    print(f"cutoff {CUTOFF} | warm villagers evaluated {len(warm)}\n")

    print(f"| Approach | Precision@{K} | Recall@{K} | NDCG@{K} | Hit rate | Avg. suggested "
          "| Avg. precision (candidates) | ROC-AUC | Fit (s) |")
    print("|---|---|---|---|---|---|---|---|---|")

    baseline = Usual(half_life=5).fit(train)
    print(row("Baseline: usual (recency-weighted)",
              evaluate(baseline, targets, warm, declared, cat_all), " - | - | - |"))

    results = {}
    for name in ["logreg", "rf", "hgb"]:
        t0 = time.time()
        model = BuyAgain(name).fit(train, catalog)
        fit_s = time.time() - t0
        ap, auc, base_rate = classification_scores(model, targets, warm)
        r = evaluate(model, targets, warm, declared, cat_all)
        results[name] = (model, r)
        print(row(model.name, r, f" {ap:.3f} | {auc:.3f} | {fit_s:.1f} |"))
    print(f"\n(training samples: {model.n_samples}, positive rate in training: "
          f"{model.positive_rate:.3f}, positive rate among test candidates: {base_rate:.3f})")

    best = max(results, key=lambda n: results[n][1]["ndcg"])
    model = results[best][0]
    print(f"\nConfidence threshold, model = {model.name}")
    print(f"| min_proba | Precision@{K} (of suggested) | Avg. suggested | Villagers with no suggestion |")
    print("|---|---|---|---|")
    for threshold in [0.0, 0.3, 0.5, 0.7, 0.8]:
        model.min_proba = threshold
        r = evaluate(model, targets, warm, declared, cat_all)
        hits = r["precision"] * K / max(r["avg_recommended"], 1e-9)  # precision among suggested
        none = sum(1 for u in warm if not model.rank(u)) / len(warm)
        print(f"| {threshold} | {hits:.3f} | {r['avg_recommended']:.2f} | {none:.1%} |")
    model.min_proba = 0.0

    t0 = time.time()
    for u in warm:
        model.rank(u)
    print(f"\nServing: {(time.time() - t0) / len(warm) * 1000:.3f} ms per villager (scores precomputed)")


if __name__ == "__main__":
    main()