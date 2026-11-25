import os
from pathlib import Path

import pandas as pd

DATA_DIR = Path(os.environ.get("RECO_DATA_DIR", Path(__file__).resolve().parent.parent / "data"))


def _split(value):
    if isinstance(value, str) and value:
        return frozenset(value.split("|"))
    return frozenset()


def load_catalog(data_dir=DATA_DIR):
    df = pd.read_csv(Path(data_dir) / "flowshopper_catalog.csv")
    df["allergens"] = df["allergens"].map(_split)
    df["labels"] = df["labels"].map(_split)
    return df


def load_orders(data_dir=DATA_DIR):
    return pd.read_csv(Path(data_dir) / "flowshopper_orders.csv", parse_dates=["order_date"])


def load_users(data_dir=DATA_DIR):
    df = pd.read_csv(Path(data_dir) / "flowshopper_users.csv")
    df["declared_diets"] = df["declared_diets"].map(_split)
    df["declared_allergens"] = df["declared_allergens"].map(_split)
    df["favorite_categories"] = df["favorite_categories"].map(_split)
    return df


def catalog_allergens(catalog):
    """product id -> frozenset of allergens."""
    return dict(zip(catalog["id"], catalog["allergens"]))


def declared_allergens(users):
    """user id -> frozenset of allergens the villager declared (and nothing else)."""
    return dict(zip(users["user_id"], users["declared_allergens"]))