from .allergens import is_safe


def recommend(model, user_id, k, declared_allergens, catalog_allergens):
    declared = declared_allergens.get(user_id, frozenset())
    out = []
    for product_id, reason in model.rank(user_id):
        if not is_safe(catalog_allergens.get(product_id), declared):
            continue
        out.append((product_id, reason))
        if len(out) == k:
            break
    return out