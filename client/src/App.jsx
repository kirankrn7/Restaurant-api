import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

const INITIAL_RECOMMENDATIONS = [
  {
    id: "rec-colectivo",
    name: "Colectivo Coffee Lakefront",
    cuisine: "Cafe",
    location: "Lincoln Memorial Dr, Milwaukee",
    rating: 4.8,
    priceRange: "$$",
    highlight:
      "A lakefront cafe featuring wood-roasted coffee, fresh bakery items, and patio views.",
  },
  {
    id: "rec-odd-duck",
    name: "Odd Duck",
    cuisine: "Global Small Plates",
    location: "Walker's Point, Milwaukee",
    rating: 4.8,
    priceRange: "$$$",
    highlight:
      "A rotating small-plate menu featuring global flavors and Wisconsin produce.",
  },
  {
    id: "rec-dandan",
    name: "DanDan",
    cuisine: "Chinese / Asian",
    location: "Historic Third Ward, Milwaukee",
    rating: 4.7,
    priceRange: "$$$",
    highlight: "Modern Asian dishes, noodles, and creative dim sum.",
  },
  {
    id: "rec-lakefront",
    name: "Lakefront Brewery Beer Hall",
    cuisine: "Brewpub",
    location: "Brewers Hill, Milwaukee",
    rating: 4.7,
    priceRange: "$$",
    highlight:
      "A popular Wisconsin beer hall featuring fish fry and cheese curds.",
  },
];

function getRestaurantImage(restaurant) {
  const name = (restaurant.name || "").toLowerCase();
  const cuisine = (restaurant.cuisine || "").toLowerCase();

  if (
    name.includes("colectivo") ||
    name.includes("collectivo") ||
    name.includes("haraz") ||
    name.includes("cafe") ||
    name.includes("coffee") ||
    cuisine.includes("cafe") ||
    cuisine.includes("coffee")
  ) {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("gordo") ||
    name.includes("waffle") ||
    cuisine.includes("dessert") ||
    cuisine.includes("waffle")
  ) {
    return "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("chick-fil-a") ||
    name.includes("dave") ||
    name.includes("mad chicken") ||
    cuisine.includes("chicken")
  ) {
    return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("duck") ||
    cuisine.includes("small plate") ||
    cuisine.includes("steak")
  ) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("dandan") ||
    cuisine.includes("chinese") ||
    cuisine.includes("asian")
  ) {
    return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("lakefront") ||
    cuisine.includes("brewpub") ||
    cuisine.includes("beer")
  ) {
    return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("mcdonald") ||
    name.includes("mc donalds") ||
    cuisine.includes("burger") ||
    cuisine.includes("american") ||
    cuisine.includes("fast food")
  ) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("olive garden") ||
    cuisine.includes("italian") ||
    cuisine.includes("pasta") ||
    cuisine.includes("pizza")
  ) {
    return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&auto=format&fit=crop&q=80";
  }

  if (
    name.includes("chipotle") ||
    cuisine.includes("mexican") ||
    cuisine.includes("taco")
  ) {
    return "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&auto=format&fit=crop&q=80";
  }

  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
}

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState(
    () => localStorage.getItem("email") || ""
  );
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorite_restaurants");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recommendations, setRecommendations] = useState(() => {
    try {
      const saved = localStorage.getItem("curated_recommendations");
      return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
    } catch {
      return INITIAL_RECOMMENDATIONS;
    }
  });

  const [showAddRecForm, setShowAddRecForm] = useState(false);
  const [recName, setRecName] = useState("");
  const [recCuisine, setRecCuisine] = useState("");
  const [recLocation, setRecLocation] = useState("");
  const [recRating, setRecRating] = useState("4.8");
  const [recPrice, setRecPrice] = useState("$$");
  const [recHighlight, setRecHighlight] = useState("");

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");
  const [priceRange, setPriceRange] = useState("$$");

  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const formSectionRef = useRef(null);
  const filterSectionRef = useRef(null);

  function isAlreadyInCollection(pickName) {
    return restaurants.some(
      (restaurant) =>
        (restaurant.name || "").toLowerCase().trim() ===
        (pickName || "").toLowerCase().trim()
    );
  }

  useEffect(() => {
    if (!token) {
      setRestaurants([]);
      return;
    }

    async function fetchRestaurants() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/restaurants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Could not load restaurants."
          );
        }

        setRestaurants(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [token]);

  function toggleFavorite(restaurantId) {
    setFavorites((previous) => {
      const updated = previous.includes(restaurantId)
        ? previous.filter((id) => id !== restaurantId)
        : [...previous, restaurantId];

      localStorage.setItem(
        "favorite_restaurants",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  function handleCreateRecommendation(event) {
    event.preventDefault();

    if (!recName.trim()) return;

    const newRecommendation = {
      id: `rec-${Date.now()}`,
      name: recName.trim(),
      cuisine: recCuisine.trim() || "American",
      location: recLocation.trim() || "Milwaukee",
      rating: Number(recRating) || 4.5,
      priceRange: recPrice,
      highlight:
        recHighlight.trim() ||
        "A local restaurant recommended by food enthusiasts.",
    };

    const updated = [newRecommendation, ...recommendations];

    setRecommendations(updated);
    localStorage.setItem(
      "curated_recommendations",
      JSON.stringify(updated)
    );

    setRecName("");
    setRecCuisine("");
    setRecLocation("");
    setRecRating("4.8");
    setRecPrice("$$");
    setRecHighlight("");
    setShowAddRecForm(false);

    setMessage(`Added ${newRecommendation.name} to Recommended shelf!`);
  }

  function handleRemoveRecommendation(id) {
    const updated = recommendations.filter(
      (recommendation) => recommendation.id !== id
    );

    setRecommendations(updated);
    localStorage.setItem(
      "curated_recommendations",
      JSON.stringify(updated)
    );
  }

  async function handleAddRecommendedToCollection(pick) {
    setError("");
    setMessage("");

    if (!token) {
      setError("Please sign in before adding a restaurant.");
      return;
    }

    if (isAlreadyInCollection(pick.name)) {
      setMessage(`${pick.name} is already in your collection.`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pick.name,
          cuisine: pick.cuisine,
          location: pick.location,
          rating: pick.rating,
          priceRange: pick.priceRange,
          open: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not add restaurant."
        );
      }

      setRestaurants((previous) => [...previous, data]);
      setMessage(`Added ${pick.name} to your collection!`);

      document.getElementById("restaurants")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setName("");
    setCuisine("");
    setLocation("");
    setRating("");
    setPriceRange("$$");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    setToken("");
    setRestaurants([]);
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
    setEditingId(null);
    setShowAddForm(false);
    setShowProfile(false);
    setShowFilters(false);
    setCuisineFilter("All");
    setStatusFilter("All");
    setOnlyFavorites(false);

    resetForm();
  }

  function handleToggleFilters() {
    const next = !showFilters;

    setShowFilters(next);
    setShowProfile(false);

    if (next) {
      setTimeout(() => {
        filterSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 60);
    }
  }

  function handleToggleAddForm() {
    if (showAddForm || editingId) {
      handleCancelForm();
    } else {
      resetForm();
      setEditingId(null);
      setError("");
      setMessage("");
      setShowAddForm(true);
      setShowProfile(false);

      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 60);
    }
  }

  async function handleAddRestaurant(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          cuisine,
          location,
          rating: rating === "" ? undefined : Number(rating),
          priceRange,
          open: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not add restaurant."
        );
      }

      setRestaurants((previous) => [...previous, data]);
      resetForm();
      setShowAddForm(false);
      setMessage("Restaurant added successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEditClick(restaurant) {
    setEditingId(restaurant._id);
    setShowAddForm(false);
    setName(restaurant.name || "");
    setCuisine(restaurant.cuisine || "");
    setLocation(restaurant.location || "");
    setRating(restaurant.rating ?? "");
    setPriceRange(restaurant.priceRange || "$$");
    setError("");
    setMessage("");

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  async function handleUpdateRestaurant(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/restaurants/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            cuisine,
            location,
            rating: rating === "" ? undefined : Number(rating),
            priceRange,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not update restaurant."
        );
      }

      setRestaurants((previous) =>
        previous.map((restaurant) =>
          restaurant._id === editingId ? data : restaurant
        )
      );

      resetForm();
      setEditingId(null);
      setMessage("Restaurant updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancelForm() {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
    setError("");
    setMessage("");
  }

  async function handleDeleteRestaurant(restaurantId) {
    if (
      !window.confirm("Are you sure you want to delete this restaurant?")
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/restaurants/${restaurantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.error || data.message || "Could not delete restaurant."
        );
      }

      setRestaurants((previous) =>
        previous.filter((restaurant) => restaurant._id !== restaurantId)
      );

      setFavorites((previous) => {
        const updated = previous.filter((id) => id !== restaurantId);
        localStorage.setItem(
          "favorite_restaurants",
          JSON.stringify(updated)
        );
        return updated;
      });

      if (editingId === restaurantId) {
        handleCancelForm();
      }

      setMessage("Restaurant deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  }

  const cuisineOptions = useMemo(
    () => [
      "All",
      ...new Set(
        restaurants
          .map((restaurant) => restaurant.cuisine)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      ),
    ],
    [restaurants]
  );

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const matchesCuisine =
          cuisineFilter === "All" ||
          restaurant.cuisine === cuisineFilter;

        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Open" && restaurant.open === true) ||
          (statusFilter === "Closed" && restaurant.open === false);

        const matchesFavorite =
          !onlyFavorites || favorites.includes(restaurant._id);

        return matchesCuisine && matchesStatus && matchesFavorite;
      }),
    [restaurants, cuisineFilter, statusFilter, onlyFavorites, favorites]
  );

  const activeFilterCount =
    Number(cuisineFilter !== "All") +
    Number(statusFilter !== "All") +
    Number(onlyFavorites);

  return (
    <div className="app" id="top">
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          onClick={(event) => event.preventDefault()}
        >
          <span className="brand-icon">RF</span>
          <span>
            <strong>Restaurant Finder</strong>
            <small>DISCOVER &amp; MANAGE DINING</small>
          </span>
        </a>

        {token && (
          <nav className="top-actions">
            <button
              className={`button button-light filter-button ${
                showFilters ? "is-active" : ""
              }`}
              type="button"
              onClick={handleToggleFilters}
            >
              <span>☷</span>
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>

            <button
              className="button button-primary"
              type="button"
              onClick={handleToggleAddForm}
            >
              <span>＋</span>
              <span>
                {showAddForm || editingId ? "Cancel" : "Add Restaurant"}
              </span>
            </button>

            <div className="profile-wrapper">
              <button
                type="button"
                className="profile-button"
                aria-label="Open profile menu"
                aria-expanded={showProfile}
                onClick={() => {
                  setShowProfile((previous) => !previous);
                  setShowFilters(false);
                }}
              >
                <span className="profile-avatar">
                  {(email[0] || "U").toUpperCase()}
                </span>
                <span className="profile-chevron">⌄</span>
              </button>

              {showProfile && (
                <div className="profile-menu">
                  <span className="profile-menu-label">SIGNED IN AS</span>
                  <strong className="profile-email">{email}</strong>
                  <div className="profile-divider" />
                  <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <span>↪</span> Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {!token ? (
        <main className="login-page">
          <section className="login-card">
            <div className="login-mark">RF</div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>Restaurant Finder</h1>
            <p className="login-description">
              Sign in to manage and explore your local dining directory.
            </p>

            {error && (
              <div className="notice notice-error" role="alert">
                {error}
              </div>
            )}

            <form className="restaurant-form" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button
                className="button button-primary login-submit"
                type="submit"
              >
                Sign in <span>→</span>
              </button>
            </form>
          </section>
        </main>
      ) : (
        <main className="main-content">
          <section className="hero">
            <div className="hero-copy">
              <span className="hero-kicker">
                <span className="hero-kicker-dot" />
                MILWAUKEE DINING GUIDE
              </span>

              <h1>
                Good food.
                <br />
                <span>Great places.</span>
              </h1>

              <p>
                Discover local culinary gems, star your favorite spots,
                and organize places worth returning to.
              </p>

              <a className="hero-link" href="#restaurants">
                Explore collection <span>↓</span>
              </a>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-plate">
                <span className="plate-food">✳</span>
                <span className="plate-leaf">❋</span>
              </div>
              <span className="floating-note note-top">CURATED TASTE</span>
              <span className="floating-note note-bottom">LOCAL PICKS</span>
            </div>
          </section>

          <section className="local-picks-section">
            <div className="picks-header-row">
              <div>
                <p className="eyebrow">RECOMMENDED PICKS</p>
                <h2>Top Places in Milwaukee</h2>
              </div>

              <button
                type="button"
                className="button button-light"
                onClick={() => setShowAddRecForm((previous) => !previous)}
              >
                {showAddRecForm ? "Cancel" : "＋ Add Custom Pick"}
              </button>
            </div>

            {showAddRecForm && (
              <form
                className="add-custom-pick-form"
                onSubmit={handleCreateRecommendation}
              >
                <input
                  placeholder="Restaurant name"
                  value={recName}
                  onChange={(event) => setRecName(event.target.value)}
                  required
                />
                <input
                  placeholder="Cuisine"
                  value={recCuisine}
                  onChange={(event) => setRecCuisine(event.target.value)}
                  required
                />
                <input
                  placeholder="Location"
                  value={recLocation}
                  onChange={(event) => setRecLocation(event.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="Rating"
                  value={recRating}
                  onChange={(event) => setRecRating(event.target.value)}
                />
                <select
                  aria-label="Recommendation price range"
                  value={recPrice}
                  onChange={(event) => setRecPrice(event.target.value)}
                >
                  <option value="$">$ · Budget friendly</option>
                  <option value="$$">$$ · Moderate</option>
                  <option value="$$$">$$$ · Upscale</option>
                  <option value="$$$$">$$$$ · Fine dining</option>
                </select>
                <input
                  placeholder="Highlight notes"
                  value={recHighlight}
                  onChange={(event) =>
                    setRecHighlight(event.target.value)
                  }
                />
                <button type="submit" className="button button-primary">
                  Add Pick
                </button>
              </form>
            )}

            <div className="local-picks-grid">
              {recommendations.map((pick) => {
                const inCollection = isAlreadyInCollection(pick.name);

                return (
                  <div className="pick-card" key={pick.id || pick.name}>
                    <div className="pick-header">
                      <h3>{pick.name}</h3>
                      <span className="pick-rating">★ {pick.rating}</span>
                    </div>

                    <span className="pick-badge">
                      {pick.id === "rec-colectivo" ? "Featured Pick · " : ""}
                      {pick.cuisine} · {pick.priceRange}
                    </span>

                    <p className="pick-desc">{pick.highlight}</p>

                    <div className="pick-actions">
                      {inCollection ? (
                        <a
                          href="#restaurants"
                          className="button button-light pick-add-btn"
                        >
                          ✓ In your collection
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="button button-light pick-add-btn"
                          onClick={() =>
                            handleAddRecommendedToCollection(pick)
                          }
                        >
                          ＋ Add to collection
                        </button>
                      )}

                      {pick.id?.startsWith("rec-") &&
                        pick.id !== "rec-colectivo" && (
                          <button
                            type="button"
                            className="pick-remove-btn"
                            title="Remove recommendation"
                            onClick={() =>
                              handleRemoveRecommendation(pick.id)
                            }
                          >
                            ✕
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {(showAddForm || editingId) && (
            <section className="form-panel" ref={formSectionRef}>
              <div className="form-panel-heading">
                <div>
                  <p className="eyebrow">
                    {editingId ? "UPDATE ENTRY" : "ADD NEW RESTAURANT"}
                  </p>
                  <h2>
                    {editingId ? "Edit restaurant" : "Add a restaurant"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="icon-close"
                  onClick={handleCancelForm}
                >
                  ✕
                </button>
              </div>

              <form
                className="restaurant-form form-grid"
                onSubmit={
                  editingId
                    ? handleUpdateRestaurant
                    : handleAddRestaurant
                }
              >
                <div>
                  <label htmlFor="restaurantName">Restaurant name</label>
                  <input
                    id="restaurantName"
                    value={name}
                    placeholder="Restaurant name"
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cuisine">Cuisine</label>
                  <input
                    id="cuisine"
                    value={cuisine}
                    placeholder="e.g. Cafe"
                    onChange={(event) => setCuisine(event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    value={location}
                    placeholder="City or neighborhood"
                    onChange={(event) => setLocation(event.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rating">Rating (0–5)</label>
                  <input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.8"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="priceRange">Price range</label>
                  <select
                    id="priceRange"
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                  >
                    <option value="$">$ · Budget friendly</option>
                    <option value="$$">$$ · Moderate</option>
                    <option value="$$$">$$$ · Upscale</option>
                    <option value="$$$$">$$$$ · Fine dining</option>
                  </select>
                </div>

                <div className="form-submit-row">
                  <button className="button button-primary" type="submit">
                    {editingId ? "Save changes" : "Add restaurant"}
                  </button>
                  <button
                    className="button button-light"
                    type="button"
                    onClick={handleCancelForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          {error && (
            <div className="notice notice-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="notice notice-success" role="status">
              {message}
            </div>
          )}

          {showFilters && (
            <section className="filter-panel" ref={filterSectionRef}>
              <div className="filter-panel-heading">
                <div>
                  <h3>Refine collection</h3>
                  <p>Narrow down your search by cuisine or open status.</p>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setCuisineFilter("All");
                    setStatusFilter("All");
                    setOnlyFavorites(false);
                  }}
                >
                  Clear all filters
                </button>
              </div>

              <div className="filter-fields">
                <div>
                  <label htmlFor="cuisineFilter">Cuisine</label>
                  <select
                    id="cuisineFilter"
                    value={cuisineFilter}
                    onChange={(event) =>
                      setCuisineFilter(event.target.value)
                    }
                  >
                    {cuisineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "All" ? "All cuisines" : option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="statusFilter">Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                  >
                    <option value="All">Open and closed</option>
                    <option value="Open">Open only</option>
                    <option value="Closed">Closed only</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          <section className="restaurant-section" id="restaurants">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR COLLECTION</p>
                <h2>Explore restaurants</h2>
                <p className="section-description">
                  Manage, edit, and favorite your dining spots.
                </p>
              </div>

              <div className="collection-controls">
                <button
                  type="button"
                  className={`fav-filter-btn ${
                    onlyFavorites ? "active" : ""
                  }`}
                  onClick={() =>
                    setOnlyFavorites((previous) => !previous)
                  }
                >
                  <span>
                    {onlyFavorites ? "♥ Only Favorites" : "♡ View Favorites"}
                  </span>
                  <span>({favorites.length})</span>
                </button>

                <span className="result-count">
                  {filteredRestaurants.length}{" "}
                  {filteredRestaurants.length === 1 ? "PLACE" : "PLACES"}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner" />
                <h3>Finding restaurants...</h3>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⌕</span>
                <h3>
                  {onlyFavorites ? "No favorites yet" : "No restaurants found"}
                </h3>
                <p>
                  {onlyFavorites
                    ? "Click Add to Favorites on any restaurant card."
                    : "Add a spot from Recommended above or use the Add Restaurant button."}
                </p>
                {onlyFavorites && (
                  <button
                    className="button button-light"
                    type="button"
                    onClick={() => setOnlyFavorites(false)}
                  >
                    View all places
                  </button>
                )}
              </div>
            ) : (
              <div className="restaurant-list">
                {filteredRestaurants.map((restaurant) => {
                  const isFavorite = favorites.includes(restaurant._id);

                  return (
                    <article
                      className="restaurant-card"
                      key={restaurant._id}
                    >
                      <div className="restaurant-photo-wrap">
                        <img
                          className="restaurant-image"
                          src={getRestaurantImage(restaurant)}
                          alt={restaurant.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
                          }}
                        />

                        {/* Visible favorite button */}
                        <button
                          type="button"
                          className={`button-favorite ${
                            isFavorite ? "is-favorite" : ""
                          }`}
                          aria-label={
                            isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-pressed={isFavorite}
                          onClick={() =>
                            toggleFavorite(restaurant._id)
                          }
                        >
                          {isFavorite
                            ? "♥ Remove Favorite"
                            : "♡ Add to Favorites"}
                        </button>

                        <span
                          className={`status-badge ${
                            restaurant.open
                              ? "status-open"
                              : "status-closed"
                          }`}
                        >
                          <span className="status-dot" />
                          {restaurant.open ? "Open now" : "Closed"}
                        </span>

                        <span className="photo-price">
                          {restaurant.priceRange || "$$"}
                        </span>
                      </div>

                      <div className="restaurant-card-content">
                        <div className="card-title-row">
                          <div>
                            <p className="card-cuisine">
                              {restaurant.cuisine || "Dining"}
                            </p>
                            <h3>{restaurant.name}</h3>
                          </div>

                          <span className="rating">
                            <span>★</span> {restaurant.rating ?? "—"}
                          </span>
                        </div>

                        <p className="restaurant-location">
                          <span>⌖</span>{" "}
                          {restaurant.location || "Location not provided"}
                        </p>

                        <div className="card-divider" />

                        <div className="restaurant-actions">
                          <button
                            type="button"
                            className="button button-card-edit"
                            onClick={() => handleEditClick(restaurant)}
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            className="button button-card-delete"
                            onClick={() =>
                              handleDeleteRestaurant(restaurant._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="site-footer">
            <span className="footer-brand">Restaurant Finder</span>
            <span>Discovering good food, one place at a time.</span>
          </footer>
        </main>
      )}
    </div>
  );
}

export default App;
