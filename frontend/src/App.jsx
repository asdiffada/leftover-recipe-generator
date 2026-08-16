import { useState, useEffect } from "react";
import "./App.css";
import MainLayout from "./main_layout.jsx";
import HomePage from "./pages/home_page.jsx";
import StepsPage from "./pages/steps_page.jsx";
import ResultPage from "./pages/result_page.jsx";

export default function App() {
  const [page, setPage] = useState("home"); // "home" | "results" | "steps"
  const [direction, setDirection] = useState("down"); // "down" | "up"
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Sync state with URL Hash for dynamic routing (e.g. #/recipe/:id)
  useEffect(() => {
    function handleRouteFromHash() {
      const hash = window.location.hash;
      const match = hash.match(/^#\/recipe\/(\d+)/);
      if (match) {
        const id = parseInt(match[1], 10);
        setSelectedRecipeId(id);
        setPage("steps");
      } else if (hash === "#/results" && searchResults) {
        setPage("results");
      }
    }

    handleRouteFromHash();
    window.addEventListener("hashchange", handleRouteFromHash);
    return () => window.removeEventListener("hashchange", handleRouteFromHash);
  }, [searchResults]);

  // Handle successful recipe search from backend
  function handleSearchResults(results, queryIngredients = ingredients) {
    setSearchResults(results);
    setDirection("down");
    setPage("results");
    window.location.hash = "#/results";

    // Dynamically append new search to history list ONLY if matching recipes exist
    if (results && Array.isArray(results) && results.length > 0) {
      const searchTitle = queryIngredients.join(", ") || "Recipe Search";
      const newHistoryItem = {
        id: Date.now().toString(),
        title: searchTitle,
        ingredients: [...queryIngredients],
        results,
      };
      setActiveHistoryId(newHistoryItem.id);
      setHistoryList((prev) => [newHistoryItem, ...prev]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Action: New Chat (Reset state)
  function handleNewChat() {
    setIngredients([]);
    setSearchResults(null);
    setSelectedRecipe(null);
    setSelectedRecipeId(null);
    setActiveHistoryId(null);
    setDirection("up");
    setPage("home");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Action: Select History item
  function handleSelectHistory(item) {
    setActiveHistoryId(item.id);
    if (item.ingredients) {
      setIngredients(item.ingredients);
    }
    if (item.results && item.results.length > 0) {
      setSearchResults(item.results);
      setDirection("down");
      setPage("results");
      window.location.hash = "#/results";
    } else {
      setDirection("up");
      setPage("home");
      window.location.hash = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToSteps(recipe) {
    setSelectedRecipe(recipe);
    if (recipe && recipe.id !== undefined) {
      setSelectedRecipeId(recipe.id);
      window.location.hash = `#/recipe/${recipe.id}`;
    } else {
      window.location.hash = "#/steps";
    }
    setDirection("down");
    setPage("steps");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToHome() {
    setDirection("up");
    setPage("home");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToResults() {
    setDirection("up");
    setPage("results");
    if (searchResults && searchResults.length > 0) {
      window.location.hash = "#/results";
    } else {
      window.location.hash = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <MainLayout
      onNewChat={handleNewChat}
      historyList={historyList}
      activeHistoryId={activeHistoryId}
      onSelectHistory={handleSelectHistory}
      hideSidebar={page === "steps"}
    >
      <main style={{ overflowX: "hidden", minHeight: "100vh" }}>
        <div key={page} className={`page-transition-${direction}`}>
          {page === "home" && (
            <HomePage
              onResults={handleSearchResults}
              ingredients={ingredients}
              setIngredients={setIngredients}
            />
          )}
          {page === "results" && (
            <ResultPage
              results={searchResults}
              onViewSteps={goToSteps}
              onBackToHome={goToHome}
            />
          )}
          {page === "steps" && (
            <StepsPage
              recipe={selectedRecipe}
              recipeId={selectedRecipeId}
              onBack={goToResults}
            />
          )}
        </div>
      </main>
    </MainLayout>
  );
}