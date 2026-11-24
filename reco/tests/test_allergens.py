from src.allergens import is_safe


def test_declared_allergen_is_never_safe():
    assert not is_safe(["gluten", "milk"], ["milk"])


def test_unknown_allergens_are_never_safe():
    assert not is_safe(None, ["milk"])


def test_no_overlap_is_safe():
    assert is_safe(["soy"], ["milk"])
