import { useState, useRef, useEffect } from "react";
import { IconPlus, IconX } from "../components/icons.jsx";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function HomePage({ onResults, ingredients: externalIngredients, setIngredients: setExternalIngredients }) {
  const [draft, setDraft] = useState("");
  const [localIngredients, setLocalIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Sync with external state if provided by parent, otherwise use local state
  const ingredients = externalIngredients !== undefined ? externalIngredients : localIngredients;
  const setIngredients = setExternalIngredients || setLocalIngredients;

  function addIngredientVal(value) {
    if (!value) return;
    const formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if (ingredients.find((i) => i.toLowerCase() === formatted.toLowerCase())) return;
    setIngredients([...ingredients, formatted]);
  }

  function addIngredient() {
    const raw = draft.trim();
    if (!raw) return;
    addIngredientVal(raw);
    setDraft("");
    inputRef.current?.focus();
  }

  function removeIngredient(target) {
    setIngredients(ingredients.filter((i) => i !== target));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  }

  async function handleSearch() {
    if (ingredients.length === 0) {
      setError("Silakan masukkan minimal 1 bahan terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, top_n: 100, min_score: 0.20 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil rekomendasi resep.");
      
      onResults(data.results, ingredients);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page-container fade-in">
      <div className="home-search-wrapper">
        {/* Brand Header */}
        <div className="brand-logo-section">
          <h1 className="brand-logo-text">Pantry2Plate</h1>
        </div>

        {/* Dynamic Ingredient Tags Display */}
        {ingredients.length > 0 && (
          <div className="pantry-chips-container">
            {ingredients.map((ing) => (
              <div key={ing} className="pantry-chip filled">
                <span className="chip-label">{ing}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => removeIngredient(ing)}
                  aria-label={`Remove ${ing}`}
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pill Input Row */}
        <div className="pill-input-row">
          <input
            ref={inputRef}
            type="text"
            className="pill-input-field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Input your Ingredients"
            autoComplete="off"
          />
          <button
            type="button"
            className="pill-input-add-btn"
            onClick={addIngredient}
            disabled={!draft.trim()}
            aria-label="Add ingredient"
          >
            <IconPlus size={22} />
          </button>
        </div>

        {/* Main Search Action Button */}
        <button
          type="button"
          className="btn-find-recipes"
          onClick={handleSearch}
          disabled={ingredients.length === 0 || loading}
        >
          {loading ? (
            <div className="button-loading-content">
              <span className="mini-spinner" />
              <span>Finding Recipes...</span>
            </div>
          ) : (
            "Find Recipes"
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="pantry-error-banner">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
