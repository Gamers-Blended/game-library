const GenreColors = {
  RPG: "#8a2be2", // Purple
  FPS: "#ff4500", // OrangeRed
  ACTION: "#1e90ff", // DodgerBlue
  TPS: "#228b22", // ForestGreen
  STRATEGY: "#daa520", // GoldenRod
  ADVENTURE: "#ff8c00", // DarkOrange
  SIMULATION: "#20b2aa", // LightSeaGreen
  SPORTS: "#32cd32", // LimeGreen
  FIGHTING: "#dc143c", // Crimson
  RACING: "#ff6347", // Tomato
};

// Get color with fallback
export const getGenreColor = (genre) => {
  const normalizedGenre = genre.toUpperCase();
  return GenreColors[normalizedGenre] || "#777777"; // Default gray for unknown genres
};

export default GenreColors;
