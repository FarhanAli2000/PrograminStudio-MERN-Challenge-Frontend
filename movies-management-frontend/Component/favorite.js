import  { useState, useEffect } from "react";
import axios from "axios";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/favorites", {
          params: { token },
        });
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>Your Favorite Movies</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {favorites.length > 0 ? (
          favorites.map((movie) => (
            <div key={movie.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
              <h3>{movie.title}</h3>
              <p>{movie.description}</p>
            </div>
          ))
        ) : (
          <p>No favorites added yet!</p>
        )}
      </div>
    </div>
  );
};

export default Favorites;
