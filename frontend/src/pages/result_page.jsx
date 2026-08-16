import { useMemo } from "react";
import { IconArrowRight, IconExternalLink, IconUtensils } from "../components/icons.jsx";

export function RecipeTag({ tag }) {
  return <span className="pantry-tag-chip">{tag}</span>;
}

export function MatchProgressBar({ score }) {
  const pct = Math.min(100, Math.max(0, Math.round((score || 0) * 100)));

  return (
    <div className="pantry-match-badge">
      <span className="pantry-match-text">{pct}% match</span>
      <div className="pantry-match-bar-track">
        <div
          className="pantry-match-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const FORBIDDEN_TAGS = new Set([
  "pedas", "kuah", "goreng", "tumis", "bakar", "rebus", "panggang", "saus",
  "balado", "geprek", "rica", "sambal", "soto", "sop", "sup", "gulai", "kare",
  "crispy", "manis", "asam", "spicy", "soup", "resep"
]);

const HEAVY_INGREDIENTS = [
  { key: "nasi", match: ["nasi"] },
  { key: "telur", match: ["telur", "telor"] },
  { key: "ayam", match: ["ayam"] },
  { key: "sapi", match: ["sapi"] },
  { key: "kambing", match: ["kambing"] },
  { key: "daging", match: ["daging"] },
  { key: "ikan", match: ["ikan", "gurame", "lele", "tongkol", "tenggiri", "nila", "salmon", "tuna"] },
  { key: "udang", match: ["udang"] },
  { key: "cumi", match: ["cumi"] },
  { key: "tahu", match: ["tahu"] },
  { key: "tempe", match: ["tempe"] },
  { key: "bakso", match: ["bakso", "baso"] },
  { key: "sosis", match: ["sosis"] },
  { key: "mie", match: ["mie", "bihun", "kwetiau", "ramen", "pasta"] },
  { key: "sayuran", match: ["sayur", "capcay", "bayam", "kangkung", "brokoli", "buncis"] },
  { key: "kentang", match: ["kentang"] },
];

export function getRecipeTags(recipe) {
  const titleLower = (recipe.title || "").toLowerCase();
  const ingLower = (recipe.ingredients || "").toLowerCase();
  const catLower = (recipe.category || "").toLowerCase().trim();
  const tags = [];

  if (catLower && !FORBIDDEN_TAGS.has(catLower)) {
    tags.push(catLower);
  }

  for (const item of HEAVY_INGREDIENTS) {
    if (tags.includes(item.key)) continue;
    const matchesTitle = item.match.some((m) => titleLower.includes(m));
    const matchesIng = item.match.some((m) => ingLower.includes(m));
    if (matchesTitle || matchesIng) {
      tags.push(item.key);
    }
  }

  const filteredTags = tags.filter((t) => !FORBIDDEN_TAGS.has(t));

  if (filteredTags.length > 0) {
    return filteredTags.slice(0, 3);
  }
  return catLower && !FORBIDDEN_TAGS.has(catLower) ? [catLower] : [];
}

export function formatIngredientsText(raw) {
  if (!raw) return "";
  if (Array.isArray(raw)) return raw.join(", ");
  let list = [];
  if (raw.includes("--")) {
    list = raw.split("--");
  } else if (raw.includes("\n")) {
    list = raw.split(/\r?\n/);
  } else {
    return raw.trim();
  }
  return list
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter((s) => s.length > 0)
    .join(", ");
}

export function SkeletonGrid() {
  return (
    <div className="pantry-results-grid">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="pantry-recipe-card skeleton-card">
          <div className="pantry-card-header">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-score" />
          </div>
          <div className="pantry-card-tags">
            <div className="skeleton-line skeleton-chip" />
            <div className="skeleton-line skeleton-chip" />
          </div>
          <div className="pantry-card-ingredients">
            <div className="skeleton-line skeleton-text-full" />
            <div className="skeleton-line skeleton-text-half" style={{ marginTop: 6 }} />
          </div>
          <hr className="pantry-card-divider" />
          <div className="pantry-card-footer">
            <div className="skeleton-line skeleton-btn" />
            <div className="skeleton-line skeleton-source" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultPage({ results, loading = false, onViewSteps, onBackToHome }) {
  const sortedResults = useMemo(() => {
    if (!results || !Array.isArray(results)) return [];
    return [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [results]);

  if (loading) {
    return (
      <div className="pantry-result-page-container fade-in">
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="pantry-result-page-container fade-in-up">
      {sortedResults.length > 0 ? (
        <div className="pantry-results-grid">
          {sortedResults.map((recipe, idx) => {
            const tags = getRecipeTags(recipe);
            const ingredientsText = formatIngredientsText(recipe.ingredients);

            return (
              <article
                key={recipe.url || recipe.title || idx}
                className="pantry-recipe-card"
                onClick={() => onViewSteps && onViewSteps(recipe)}
              >
                <div className="pantry-card-header">
                  <h2 className="pantry-card-title">{recipe.title}</h2>
                  <MatchProgressBar score={recipe.score} />
                </div>

                <div className="pantry-card-tags">
                  <span className="pantry-card-label">Tags:</span>
                  <div className="pantry-tags-wrapper">
                    {tags.map((t, tagIdx) => (
                      <RecipeTag key={tagIdx} tag={t} />
                    ))}
                  </div>
                </div>

                <div className="pantry-card-ingredients">
                  <p className="pantry-ingredients-text">
                    <span className="pantry-card-label">Ingredients:</span>{" "}
                    {ingredientsText}
                  </p>
                </div>

                <hr className="pantry-card-divider" />

                <div className="pantry-card-footer">
                  <button
                    type="button"
                    className="pantry-btn-view-steps"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewSteps && onViewSteps(recipe);
                    }}
                  >
                    View cooking steps <IconArrowRight size={14} />
                  </button>

                  {recipe.url ? (
                    <a
                      href={recipe.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pantry-card-source-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Source <IconExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="pantry-card-source-text">Source</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="pantry-empty-state-container fade-in">
          <div className="pantry-empty-card">
            <div className="pantry-empty-icon-wrapper">
              <IconUtensils size={36} />
            </div>
            <h3 className="pantry-empty-title">Tidak Ada Resep yang Cocok</h3>
            <p className="pantry-empty-desc">
              Maaf, belum ada resep yang sesuai dengan kombinasi bahan Anda.
              Coba tambahkan atau ubah bahan lainnya (seperti telur, ayam, atau nasi) di halaman pencarian.
            </p>
            {onBackToHome && (
              <button
                type="button"
                className="pantry-empty-action-btn"
                onClick={onBackToHome}
              >
                Coba Pencarian Baru
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
