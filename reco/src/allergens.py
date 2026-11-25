def is_safe(product_allergens, declared_allergens):
    if product_allergens is None:
        return False
    return not (set(product_allergens) & set(declared_allergens))


def filter_safe(product_ids, declared, catalog_allergens):
    return [p for p in product_ids if is_safe(catalog_allergens.get(p), declared)]