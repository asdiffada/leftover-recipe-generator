from flask import Flask, request, jsonify
from flask_cors import CORS
from src.controllers.recommender_controller import get_recommender

app = Flask(__name__)
CORS(app)

@app.get("/health")
def health():
    return jsonify(status="ok")

@app.post("/recommend")
def recommend():
    payload = request.get_json(force=True)
    ingredients = payload.get("ingredients", [])
    top_n = payload.get("top_n", 100)
    min_score = payload.get("min_score", 0.20)
    if not ingredients:
        return jsonify(error="ingredients tidak boleh kosong"), 400
    try:
        recommender = get_recommender()
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503
    results = recommender.recommend(ingredients, top_n=top_n, min_score=min_score)
    return jsonify(query=ingredients, results=results)

@app.get("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    try:
        recommender = get_recommender()
    except FileNotFoundError as e:
        return jsonify(error=str(e)), 503
    recipe = recommender.get_recipe_by_id(recipe_id)
    if not recipe:
        return jsonify(error="Resep tidak ditemukan"), 404
    return jsonify(recipe=recipe)

if __name__ == "__main__":
    app.run(debug=True, port=5000)