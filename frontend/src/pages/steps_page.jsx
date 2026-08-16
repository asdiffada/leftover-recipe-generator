import { useState, useEffect } from "react";
import { IconArrowLeft, IconAlertCircle, IconUtensils } from "../components/icons.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Helper to parse ingredients into a clean array of strings
 */
export function parseIngredientsData(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  let list = [];
  if (raw.includes("--")) {
    list = raw.split("--");
  } else if (raw.includes("\n")) {
    list = raw.split(/\r?\n/);
  } else {
    list = [raw];
  }
  return list
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter((s) => s.length > 0);
}

/**
 * Helper to parse raw step text into structured step objects with title & instruction
 */
export function parseStepsData(raw) {
  if (!raw) return [];
  let rawList = [];
  if (raw.includes("--")) {
    rawList = raw.split("--");
  } else if (/(?:^|\s+)(?:\d+[\)\.\:]|\(\d+\)|\[\d+\])\s*/g.test(raw)) {
    rawList = raw
      .split(/(?:^|\s+)(?:\d+[\)\.\:]|\(\d+\)|\[\d+\])\s*/g)
      .filter(Boolean);
  } else if (raw.includes("\n")) {
    rawList = raw.split(/\r?\n/);
  } else {
    rawList = [raw];
  }

  const cleaned = rawList
    .map((s) => s.trim().replace(/^(?:Langkah\s*\d+|Step\s*\d+|\d+[\)\.\:]|\(\d+\)|\[\d+\]|[-•*])\s*/i, ""))
    .filter((s) => s.length > 0);

  return cleaned.map((stepText, idx) => {
    // Check if step text starts with a headline/title followed by ':' or ' - '
    const colonIdx = stepText.indexOf(":");
    if (colonIdx > 0 && colonIdx < 35) {
      return {
        stepNumber: idx + 1,
        title: stepText.substring(0, colonIdx).trim(),
        instruction: stepText.substring(colonIdx + 1).trim(),
      };
    }
    const dashIdx = stepText.indexOf(" - ");
    if (dashIdx > 0 && dashIdx < 35) {
      return {
        stepNumber: idx + 1,
        title: stepText.substring(0, dashIdx).trim(),
        instruction: stepText.substring(dashIdx + 3).trim(),
      };
    }
    // No explicit headline title -> set title to null so only badge is shown
    return {
      stepNumber: idx + 1,
      title: null,
      instruction: stepText,
    };
  });
}

/**
 * Reusable Step Card Component
 */
export function StepCard({ stepNumber, title, instruction }) {
  return (
    <div className="pantry-step-card fade-in-up">
      <span className="pantry-step-badge">{stepNumber}</span>
      <div className="pantry-step-card-content">
        {title && <h3 className="pantry-step-card-title">{title}</h3>}
        <p className="pantry-step-instruction">{instruction}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for Steps Page
 */
export function StepsPageSkeleton() {
  return (
    <div className="pantry-steps-page-container fade-in">
      <div className="pantry-detail-header-skeleton">
        <div className="skeleton-line skeleton-back-circle" />
        <div className="skeleton-line skeleton-title-long" />
      </div>
      <div className="pantry-detail-card skeleton-card">
        <div className="skeleton-line skeleton-heading" />
        <div className="skeleton-line skeleton-text-full" style={{ marginTop: 12 }} />
        <div className="skeleton-line skeleton-text-full" style={{ marginTop: 8 }} />
        <div className="skeleton-line skeleton-text-half" style={{ marginTop: 8 }} />
      </div>
      <div className="pantry-steps-cards-list">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="pantry-step-card skeleton-card">
            <div className="pantry-step-card-header">
              <div className="skeleton-line skeleton-badge" />
              <div className="skeleton-line skeleton-step-title" />
            </div>
            <div className="skeleton-line skeleton-text-full" style={{ marginTop: 10 }} />
            <div className="skeleton-line skeleton-text-half" style={{ marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StepsPage({ recipe, recipeId, onBack }) {
  const [recipeData, setRecipeData] = useState(recipe || null);
  const [loading, setLoading] = useState(!recipe && Boolean(recipeId));
  const [error, setError] = useState(null);

  useEffect(() => {
    // If recipe object is passed via props, use it
    if (recipe) {
      setRecipeData(recipe);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, fetch from backend if recipeId is present
    if (recipeId !== undefined && recipeId !== null) {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/recipe/${recipeId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Resep tidak ditemukan atau terjadi kesalahan server.");
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.recipe) {
            setRecipeData(data.recipe);
          } else {
            throw new Error("Data resep tidak valid.");
          }
        })
        .catch((err) => {
          setError(err.message || "Gagal memuat detail resep.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [recipe, recipeId]);

  if (loading) {
    return <StepsPageSkeleton />;
  }

  if (error || !recipeData) {
    return (
      <div className="pantry-steps-page-container fade-in">
        <div className="pantry-detail-header">
          <button
            type="button"
            className="pantry-back-icon-btn"
            onClick={onBack}
            aria-label="Kembali"
          >
            <IconArrowLeft size={24} />
          </button>
          <h1 className="pantry-detail-header-title">Detail Resep</h1>
        </div>

        <div className="pantry-empty-card fade-in" style={{ marginTop: 24 }}>
          <div className="pantry-empty-icon-wrapper" style={{ color: "#EF4444", background: "#FEF2F2" }}>
            <IconAlertCircle size={36} />
          </div>
          <h3 className="pantry-empty-title">Resep Tidak Ditemukan</h3>
          <p className="pantry-empty-desc">
            {error || "Maaf, detail resep yang Anda cari tidak tersedia."}
          </p>
          <button
            type="button"
            className="pantry-empty-action-btn"
            onClick={onBack}
          >
            Kembali ke Hasil Pencarian
          </button>
        </div>
      </div>
    );
  }

  const ingredientsList = parseIngredientsData(recipeData.ingredients);
  const stepsList = parseStepsData(recipeData.steps);

  return (
    <div className="pantry-steps-page-container fade-in-up">
      {/* Top Header: Back Arrow + Recipe Title */}
      <header className="pantry-detail-header">
        <button
          type="button"
          className="pantry-back-icon-btn"
          onClick={onBack}
          aria-label="Kembali ke halaman sebelumnya"
          id="btn-back-header"
        >
          <IconArrowLeft size={24} />
        </button>
        <h1 className="pantry-detail-header-title">{recipeData.title}</h1>
      </header>

      {/* Ingredients Card */}
      <section className="pantry-detail-card pantry-ingredients-card fade-in-up">
        <h2 className="pantry-card-heading">Ingredients</h2>
        <ul className="pantry-ingredients-bullet-list">
          {ingredientsList.map((ing, idx) => (
            <li key={idx} className="pantry-ingredient-bullet-item">
              <span className="pantry-bullet-dot-orange" />
              <span className="pantry-ingredient-item-text">{ing}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cooking Steps Cards List */}
      <section className="pantry-steps-cards-list">
        {stepsList.map((step) => (
          <StepCard
            key={step.stepNumber}
            stepNumber={step.stepNumber}
            title={step.title}
            instruction={step.instruction}
          />
        ))}
      </section>
    </div>
  );
}
