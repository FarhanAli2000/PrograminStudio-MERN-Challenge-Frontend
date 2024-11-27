import { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  MdGridView,
  MdViewList,
  MdBrightness4,
  MdBrightness7,
  MdFavorite,
  MdSort,
} from "react-icons/md";
import logo from '/assets/logo.png';

import Auth from "../Auth.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortCriteria, setSortCriteria] = useState("none");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFavorites, setShowFavorites] = useState(false);
  const moviesPerPage = 15;

  // Sorting function
  const sortMovies = (moviesList) => {
    const sortedMovies = [...moviesList];

    if (sortCriteria === "price") {
      return sortedMovies.sort((a, b) => {
        const priceA = a.trackPrice ?? 0;
        const priceB = b.trackPrice ?? 0;

        if (sortOrder === "asc") {
          return priceA - priceB;
        } else {
          return priceB - priceA;
        }
      });
    }
    return sortedMovies;
  };

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      if (!hasMore) return;
      setIsLoading(true);
      const offset = (currentPage - 1) * moviesPerPage;

      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=star&media=movie&offset=${offset}&limit=${moviesPerPage}`
        );
        const data = await response.json();

        if (data.results.length === 0) {
          setHasMore(false);
        } else {
          setMovies((prevMovies) => {
            // Filter out any movies that are already in the list
            const newMovies = data.results.filter(
              (movie) =>
                !prevMovies.some(
                  (prevMovie) => prevMovie.trackId === movie.trackId
                )
            );

            // Sort and append the new movies
            const updatedMovies = [...prevMovies, ...newMovies];
            return sortMovies(updatedMovies);
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage, hasMore, sortOrder]);

  // Handle sorting criteria change
  useEffect(() => {
    if (movies.length > 0) {
      const sorted = sortMovies(movies);
      setMovies(sorted);
    }
  }, [sortCriteria, sortOrder]);

  // Handle scroll for pagination
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50 &&
      !isLoading &&
      hasMore
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [isLoading, hasMore]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  if (!token) {
    return (
      <Auth
        setToken={(newToken) => {
          localStorage.setItem("token", newToken);
          setToken(newToken);
        }}
      />
    );
  }

  // Add movie to favorites
  const addToFavorites = async (movie) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/favorites", { token, movie });
      setFavorites((prevFavorites) => [...prevFavorites, movie]);
      alert("Movie added to favorites");
    } catch (error) {
      console.error("Failed to add movie to favorites:", error);
      alert("Failed to add movie to favorites");
    }
  };

  // Movie detail page
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleBackToMovies = () => {
    setSelectedMovie(null); // Go back to movie list
  };

  const renderVideo = (movie) => {
    if (movie.previewUrl) {
      return (
        <div className="video-container">
          <h3>Watch Trailer</h3>
          <iframe
            src={movie.previewUrl}
            title={movie.trackName}
            width="560"
            height="315"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (movie.trackVideoUrl) {
      return (
        <div className="video-container">
          <h3>Watch Trailer</h3>
          <video width="560" height="315" controls>
            <source src={movie.trackVideoUrl} type="video/mp4" />
            Your browser does not support the video tag. Please use a browser
            that supports HTML5 video.
          </video>
        </div>
      );
    }

    return (
      <div className="video-container">
        <p>Trailer not available.</p>
      </div>
    );
  };

  // Related movies based on genre
  const getRelatedMovies = (selectedMovie) => {
    if (!selectedMovie || !selectedMovie.primaryGenreName) return [];
    return movies.filter(
      (movie) =>
        movie.primaryGenreName === selectedMovie.primaryGenreName &&
        movie.trackId !== selectedMovie.trackId // Exclude the current movie
    );
  };

  return (
    <Router>
      <div className={`container ${isDarkMode ? "dark" : ""}`}>
      <div className="header-container">
      <img src={logo} alt="App Logo" className="logo" />
        <h1>iTunes Movies</h1>
        <div className="header">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
          >
            Logout 
          </button>
          </div>
          <MdFavorite
            className="favorite-icon"
            onClick={() => setShowFavorites(!showFavorites)}
            title="Show Favorites"
          />
        </div>
        <div className="controls">
          <div className="view-icons">
            <MdViewList
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "active" : ""}
            />
            <MdGridView
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "active" : ""}
            />
            <button onClick={toggleDarkMode}>
              {isDarkMode ? <MdBrightness7 /> : <MdBrightness4 />}
            </button>
          </div>
          <div className="sort">
            <label htmlFor="sort">Sort By:</label>
            <select
              id="sort"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="">None</option>
              <option value="price">Price</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              <MdSort />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </div>

        {/* Display Favorites if showFavorites is true */}
        {showFavorites ? (
          <div className={`grid ${viewMode}`}>
            {favorites.length > 0 ? (
              favorites.map((movie, i) => (
                <div className="card" key={i}>
                  <img src={movie.artworkUrl100} alt={movie.trackName} />
                  <div className="details">
                    <h2>{movie.trackName}</h2>
                    <p>Genre: {movie.primaryGenreName || "N/A"}</p>
                    <p>
                      Price:{" "}
                      {movie.trackPrice ? `$${movie.trackPrice}` : "Free"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No favorites selected.</p>
            )}
          </div>
        ) : (
          <>
            {/* Movie Detail View */}
            {selectedMovie ? (
              <div className="detail-screen">
                <div style={{display: "flex", justifyContent: "space-between"}}>
                  <h2>{selectedMovie.trackName}</h2>
                  <button className="close-button" onClick={handleBackToMovies}>
                    Back to Movies
                  </button>
                </div>
                <div style={{display: "flex"}}>
                  <img
                    src={selectedMovie.artworkUrl100}
                    alt={selectedMovie.trackName}
                  />
                  <div style={{marginLeft: "20px"}}>
                    <p>
                      {selectedMovie.longDescription || "No description available"}
                    </p>
                    <p><b>Release Date: </b>{selectedMovie.releaseDate}</p>
                  </div>
                </div>
                {renderVideo(selectedMovie)}

                {/* Related Movies Section */}
                <div className="related-movies">
                  <h3>Related Movies</h3>
                  <div className={`grid ${viewMode}`}>
                    {getRelatedMovies(selectedMovie).map(
                      (relatedMovie, index) => (
                        <div
                          className="card"
                          key={index}
                          onClick={() => handleMovieClick(relatedMovie)}
                        >
                          <img
                            src={relatedMovie.artworkUrl100}
                            alt={relatedMovie.trackName}
                          />
                          <div className="details">
                            <h2>{relatedMovie.trackName}</h2>
                            <p>
                              Genre: {relatedMovie.primaryGenreName || "N/A"}
                            </p>
                            <p>
                              Price:{" "}
                              {relatedMovie.trackPrice
                                ? `$${relatedMovie.trackPrice}`
                                : "Free"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Movie Grid/List View
              <div className={`grid ${viewMode}`}>
                {movies.map((movie, index) => (
                  <div
                    className="card"
                    key={index}
                    onClick={() => handleMovieClick(movie)}
                  >
                    <img src={movie.artworkUrl100} alt={movie.trackName} />
                    <div className="details">
                      <h2>{movie.trackName}</h2>
                      <p>Genre: {movie.primaryGenreName || "N/A"}</p>
                      <p>
                        Price:{" "}
                        {movie.trackPrice ? `$${movie.trackPrice}` : "Free"}
                      </p>
                      <button onClick={() => addToFavorites(movie)}>
                        Add to Favorites
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Router>
  );
};

export default App;



