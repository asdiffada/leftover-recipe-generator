# Pantry2Plate

A recipe recommendation web app that suggests Indonesian dishes based on leftover ingredients you have at home.

The recommendation engine uses TF-IDF and cosine similarity to rank recipes against user input, combined with rule-based filtering to ensure recipes requiring essential ingredients (like specific proteins) aren't recommended if they're missing.

## Features

- Ingredient input with tag chips and real-time search
- Match percentage indicators for recipe results
- Rule-based filtering for essential proteins (chicken, beef, fish, eggs, tofu, etc.)
- Step-by-step cooking instructions with ingredient breakdown
- Local search history

## Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS
- **Backend**: Flask, Flask-CORS
- **ML / Data**: scikit-learn, pandas, joblib
- **Dataset**: ~14,900 Indonesian recipes

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)

### Backend Setup

1. Go to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Linux / macOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Make sure model artifacts are present in `backend/src/artifacts/` (`vectorizer.joblib`, `tfidf_matrix.joblib`, `metadata.pkl`).

5. Start the Flask server:
   ```bash
   python main.py
   ```
   The API will run at `http://localhost:5000`.

### Frontend Setup

1. Go to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` (optional, defaults to `http://localhost:5000`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## API Reference

### `GET /health`
Health check endpoint.

Response:
```json
{
  "status": "ok"
}
```

### `POST /recommend`
Get ranked recipe recommendations based on input ingredients.

Request body:
```json
{
  "ingredients": ["telur", "bawang merah", "nasi"],
  "top_n": 20,
  "min_score": 0.20
}
```

Response:
```json
{
  "query": ["telur", "bawang merah", "nasi"],
  "results": [
    {
      "id": 1024,
      "title": "Nasi Goreng Telur Sederhana",
      "category": "Nasi",
      "ingredients": "2 piring nasi putih--2 butir telur--3 siung bawang merah",
      "steps": "1. Tumis bawang.\n2. Masukkan telur dan nasi.\n3. Aduk rata.",
      "url": "https://...",
      "score": 0.85
    }
  ]
}
```

### `GET /recipe/<id>`
Fetch details for a specific recipe by index ID.

Response:
```json
{
  "recipe": {
    "id": 1024,
    "title": "Nasi Goreng Telur Sederhana",
    "category": "Nasi",
    "ingredients": "2 piring nasi putih--2 butir telur--3 siung bawang merah",
    "steps": "1. Tumis bawang.\n2. Masukkan telur dan nasi.\n3. Aduk rata.",
    "url": "https://..."
  }
}
```

## Model Training

The TF-IDF model is trained in `training/02_train_tfidf.ipynb`. Running the notebook processes raw recipe data, fits the vectorizer, and exports artifacts (`vectorizer.joblib`, `tfidf_matrix.joblib`, `metadata.pkl`) to `backend/src/artifacts/`.
