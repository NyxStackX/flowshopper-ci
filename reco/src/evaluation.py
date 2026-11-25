import math
from collections import defaultdict

from .recommend import recommend

CUTOFF = "2026-09-01"
K = 5


def temporal_split(orders, cutoff=CUTOFF):
    train = orders[orders["order_date"] < cutoff]
    after = orders[orders["order_date"] >= cutoff]
    first = after.groupby("user_id")["order_number"].transform("min")
    target_rows = after[after["order_number"] == first]
    targets = defaultdict(set)
    for user_id, product_id in zip(target_rows["user_id"], target_rows["product_id"]):
        targets[user_id].add(product_id)
    return train, dict(targets)


def precision_at_k(recs, relevant, k=K):
    return sum(1 for p in recs[:k] if p in relevant) / k


def recall_at_k(recs, relevant, k=K):
    if not relevant:
        return 0.0
    return sum(1 for p in recs[:k] if p in relevant) / len(relevant)


def ndcg_at_k(recs, relevant, k=K):
    dcg = sum(1 / math.log2(i + 2) for i, p in enumerate(recs[:k]) if p in relevant)
    ideal = sum(1 / math.log2(i + 2) for i in range(min(len(relevant), k)))
    return dcg / ideal if ideal else 0.0


def hit_at_k(recs, relevant, k=K):
    return 1.0 if any(p in relevant for p in recs[:k]) else 0.0


def evaluate(model, targets, users_to_eval, declared_allergens, catalog_allergens, k=K):
    totals = defaultdict(float)
    n = 0
    for user_id in users_to_eval:
        relevant = targets.get(user_id)
        if not relevant:
            continue
        recs = [p for p, _ in recommend(model, user_id, k, declared_allergens, catalog_allergens)]
        totals["precision"] += precision_at_k(recs, relevant, k)
        totals["recall"] += recall_at_k(recs, relevant, k)
        totals["ndcg"] += ndcg_at_k(recs, relevant, k)
        totals["hit_rate"] += hit_at_k(recs, relevant, k)
        totals["avg_recommended"] += len(recs)
        n += 1
    result = {name: value / n for name, value in totals.items()} if n else {}
    result["users"] = n
    return result