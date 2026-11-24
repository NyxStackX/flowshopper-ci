"""Allergen filter: a product with a declared allergen is never recommended.
An unknown allergen field is never treated as safe."""


def is_safe(product_allergens, declared_allergens):
    if product_allergens is None:
        return False
    return not (set(product_allergens) & set(declared_allergens))
