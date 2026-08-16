import os
from functools import lru_cache

import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from src.rules import normalize_ingredient, passes_chef_rules

ARTIFACTS_DIR = os.environ.get(
    "ARTIFACTS_DIR", os.path.join(os.path.dirname(__file__), "..", "artifacts")
)

class Recommender:
    def __init__(self, artifacts_dir=ARTIFACTS_DIR):
        vectorizer_path = os.path.join(artifacts_dir, "vectorizer.joblib")
        matrix_path = os.path.join(artifacts_dir, "tfidf_matrix.joblib")
        metadata_path = os.path.join(artifacts_dir, "metadata.pkl")

        for path in (vectorizer_path, matrix_path, metadata_path):
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Artefak tidak ditemukan: {path}. "
                    "Jalankan notebook training di Colab, download hasilnya, "
                    "lalu taruh di backend/artifacts/."
                )

        self.vectorizer = joblib.load(vectorizer_path)
        self.matrix = joblib.load(matrix_path)
        self.df = pd.read_pickle(metadata_path)

    def recommend(self, user_ingredients, top_n=100, min_score=0.20):
        norm_user = {normalize_ingredient(i) for i in user_ingredients}
        query_vec = self.vectorizer.transform([" ".join(norm_user)])
        sims = cosine_similarity(query_vec, self.matrix).flatten()
        ranked_idx = sims.argsort()[::-1]

        results = []
        for idx in ranked_idx:
            if sims[idx] < min_score:
                break
            row = self.df.iloc[idx]
            if not passes_chef_rules(row["_ingredients_list"], norm_user):
                continue
            results.append({
                "id": int(idx),
                "title": str(row.get("Title", "")),
                "ingredients": str(row.get("Ingredients", "")),
                "steps": str(row.get("Steps", "")),
                "url": str(row.get("URL", "")),
                "category": str(row.get("Category", "")),
                "score": float(sims[idx]),
            })
            if len(results) >= top_n:
                break
        return results

    def get_recipe_by_id(self, recipe_id: int):
        if recipe_id < 0 or recipe_id >= len(self.df):
            return None
        row = self.df.iloc[recipe_id]
        return {
            "id": int(recipe_id),
            "title": str(row.get("Title", "")),
            "ingredients": str(row.get("Ingredients", "")),
            "steps": str(row.get("Steps", "")),
            "url": str(row.get("URL", "")),
            "category": str(row.get("Category", "")),
        }

@lru_cache
def get_recommender():
    return Recommender()