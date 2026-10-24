// Movie lists are stored as bare JSON arrays. Parsing is defensive so a
// corrupt or missing entry falls back to an empty list.
export const readStoredMovies = (storage) => {
  try {
    return JSON.parse(localStorage.getItem(storage)) || []
  } catch {
    return []
  }
}
