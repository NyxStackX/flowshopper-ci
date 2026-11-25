import sys
import time
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data import (catalog_allergens, declared_allergens, load_catalog, load_orders,
                      load_users)
from src.evaluation import CUTOFF, K, evaluate, temporal_split
from src.features.popular_usual import Popular, Usual


def main():
    catalog, orders, users = load_catalog(), load_orders(), load_users()
    cat_all, declared = catalog_allergens(catalog), declared_allergens(users)

    train, targets = temporal_split(orders)
    warm = sorted(set(train["user_id"]))
    warm_with_target = [u for u in warm if u in targets]
    cold_with_target = [u for u in targets if u not in set(warm)]
    print(f"cutoff {CUTOFF} | train orders {train['order_id'].nunique()} | "
          f"warm villagers evaluated {len(warm_with_target)} | cold villagers {len(cold_with_target)}")
    assert train["order_date"].max() < pd.Timestamp(CUTOFF)  # no leakage

    models = [
        Popular("buyers"),
        Popular("purchases"),
        Popular("buyers", window_days=30),
        Usual(),
        Usual(last_orders=10),
        Usual(half_life=5),
    ]
    print(f"\n| Approach | Precision@{K} | Recall@{K} | NDCG@{K} | Hit rate | Avg. suggested | Fit+eval (s) |")
    print("|---|---|---|---|---|---|---|")
    for model in models:
        t0 = time.time()
        model.fit(train)
        r = evaluate(model, targets, warm_with_target, declared, cat_all)
        print(f"| {model.name} | {r['precision']:.3f} | {r['recall']:.3f} | {r['ndcg']:.3f} | "
              f"{r['hit_rate']:.3f} | {r['avg_recommended']:.2f} | {time.time() - t0:.1f} |")


if __name__ == "__main__":
    main()