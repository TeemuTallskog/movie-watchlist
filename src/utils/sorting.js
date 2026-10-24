// Display-only sorting for the library lists. Storage arrays keep their manual
// order; every sort returns a new array and never mutates the input.

const getYear = (movie) => {
  const parsed = parseInt(movie.y, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const getImdbRating = (movie, ratings) => {
  const rating = ratings?.[movie.id]
  return typeof rating === 'number' && Number.isFinite(rating) ? rating : null
}

const getPersonalRating = (movie) => {
  const rating = movie.review?.rating
  return typeof rating === 'number' && Number.isFinite(rating) ? rating : null
}

// Missing values always sort last regardless of direction; the direction only
// flips how present values compare against each other.
const compareWithMissing = (a, b, direction) => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  const result = a - b
  return direction === 'asc' ? result : -result
}

const COMPARATORS = {
  imdb: (movie, ratings) => getImdbRating(movie, ratings),
  personal: (movie) => getPersonalRating(movie),
  year: (movie) => getYear(movie),
}

// Sorts that need a direction; `custom`, `recent` and `oldest` do not.
export const SORT_WITH_DIRECTION = new Set(['imdb', 'personal', 'year'])

export const sortMovies = (movies, sort, direction = 'desc', ratings = null) => {
  const getValue = COMPARATORS[sort]
  if (!getValue) {
    // Custom, recent and oldest all derive from storage order.
    return sort === 'oldest' ? [...movies].reverse() : [...movies]
  }

  return [...movies].sort((a, b) => compareWithMissing(getValue(a, ratings), getValue(b, ratings), direction))
}
