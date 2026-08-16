# Pantry2Plate — Leftover Recipe Generator

> **Pantry2Plate** is an intelligent web application designed to recommend Indonesian recipes based on the leftover ingredients available in your pantry or refrigerator.

The system combines machine learning algorithms with business logic to ensure recommended recipes are relevant, accurate, and immediately cookable without missing essential core ingredients.

---

## Key Features

- **Dynamic Ingredient Input**: Interactively add and remove ingredients you currently have.
- **Smart Scoring & Match Percentage**: Calculates the match percentage for each recipe relative to input ingredients, visualized with clean progress bars.
- **Chef Rules & Protein Guard**: Prevents recommending recipes that require mandatory proteins unless specifically provided by the user.
- **Step-by-Step Cooking Guide**: Displays detailed ingredient quantities and structured, numbered cooking step cards.
- **Deep Linking & Hash Routing**: Seamless navigation with URL hash routing and full browser history support.
- **Search History**: Saves recent search queries within the current session for quick reference.
- **Responsive UI**: Clean, modern interface optimized for both desktop and mobile screens.

---

## Architecture & Workflow

```
[ User Inputs Ingredients ]
           │
           ▼
[ Frontend: React + Vite ] ──( HTTP POST /recommend )──▶ [ Backend: Flask API ]
                                                                   │
    ┌──────────────────────────────────────────────────────────────┘
    ▼
[ 1. Ingredient Normalization ]
    └─ Strips measurement units (sdm, siung, gram) and preparation descriptors (cincang, rebus).
    └─ Canonical tokenization: "bawang merah" -> "bawang_merah".
    │
    ▼
[ 2. TF-IDF & Cosine Similarity ]
    └─ Transforms ingredient query into a TF-IDF vector.
    └─ Computes Cosine Similarity against 14,900+ recipe vectors.
    │
    ▼
[ 3. Chef Rules Filtering ]
    └─ Checks essential core proteins (Chicken, Beef, Egg, Fish, Tofu, etc.).
    └─ Filters out recipes containing required proteins not owned by the user.
    │
    ▼
[ Return Ranked Recipe List ] ──( JSON Response )──▶ [ Frontend Displays Result Cards ]
```

---

## Tech Stack

### Frontend
- **Framework / Library**: React 19 
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS 
- **Linter**: Oxlint

### Backend
- **Framework**: Flask, Flask-CORS
- **Machine Learning / Data Processing**:
  - `scikit-learn` 
  - `pandas` and `numpy`
  - `joblib` 

### Training & Dataset
- **Environment**: Jupyter Notebook / Google Colab
- **Dataset**: ~14,945 Indonesian Recipes with 23,900+ unique ingredient tokens.

---

## Installation & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or later) & **npm**
- **Python** (v3.10 or later) & **pip**
- **Git**

---

### 2. Backend Setup (Flask API)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Ensure model artifacts are located in `backend/src/artifacts/` (`vectorizer.joblib`, `tfidf_matrix.joblib`, `metadata.pkl`).

5. Run the Flask server:
   ```bash
   python main.py
   ```
   The backend API will run at `http://127.0.0.1:5000` (or `http://localhost:5000`).

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Verify your `.env` configuration points to your backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the displayed local URL (typically `http://localhost:5173`) in your browser.

---

## API Documentation

### 1. Health Check
Verifies that the backend server is online and reachable.
- **Endpoint**: `GET /health`
- **Response** `200 OK`:
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. Recipe Recommendation
Retrieves ranked recipe recommendations based on input ingredients.
- **Endpoint**: `POST /recommend`
- **Request Body**:
  ```json
  {
    "ingredients": ["telur", "bawang merah", "cabai rawit", "nasi"],
    "top_n": 20,
    "min_score": 0.20
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "query": ["telur", "bawang merah", "cabai rawit", "nasi"],
    "results": [
      {
        "id": 1024,
        "title": "Nasi Goreng Telur Sederhana",
        "category": "Nasi",
        "ingredients": "2 piring nasi putih--2 butir telur--3 siung bawang merah--5 buah cabai rawit--garam secukupnya",
        "steps": "1. Haluskan bawang dan cabai.\n2. Orak-arik telur hingga matang.\n3. Masukkan nasi dan bumbu, aduk rata hingga matang.",
        "url": "https://cookpad.com/...",
        "score": 0.8542
      }
    ]
  }
  ```

---

### 3. Recipe Detail by ID
Fetches detailed recipe information for a specific recipe index.
- **Endpoint**: `GET /recipe/<recipe_id>`
- **Response** `200 OK`:
  ```json
  {
    "recipe": {
      "id": 1024,
      "title": "Nasi Goreng Telur Sederhana",
      "category": "Nasi",
      "ingredients": "2 piring nasi putih--2 butir telur...",
      "steps": "1. Haluskan bawang dan cabai...",
      "url": "https://cookpad.com/..."
    }
  }
  ```

---

## Model Training & Artifacts

To update the recipe dataset or retrain the model:
1. Open `training/02_train_tfidf.ipynb` in Google Colab or Jupyter Lab.
2. Upload the raw dataset (`resep_raw.csv`).
3. Run all cells to perform text cleaning, tokenization, TF-IDF vector fitting, and similarity matrix calculation.
4. Download the generated artifacts (`vectorizer.joblib`, `tfidf_matrix.joblib`, `metadata.pkl`, `model_info.json`) and place them in `backend/src/artifacts/`.
