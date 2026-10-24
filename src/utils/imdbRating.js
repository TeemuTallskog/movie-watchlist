const RATINGS_URL = 'https://api.graphql.imdb.com/'
const CACHE_KEY = 'Imdb Ratings'
// Ratings move slowly and the popup is opened often, so a week-old value is
// good enough and keeps the extension from querying IMDb on every open.
export const RATING_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000
const BATCH_SIZE = 20

const RATINGS_QUERY = `
  query Ratings($ids: [ID!]!) {
    titles(ids: $ids) {
      id
      ratingsSummary {
        aggregateRating
      }
    }
  }
`

// The public GraphQL endpoint rejects requests that do not look like they come
// from IMDb's own web client.
const REQUEST_HEADERS = {
    'content-type': 'application/json',
    'x-imdb-client-name': 'imdb-web-next',
    'x-imdb-user-country': 'US',
    'x-imdb-user-language': 'en-US',
}

export function readRatingCache() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CACHE_KEY))
        return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
        return {}
    }
}

export function isCacheEntryFresh(entry, now = Date.now()) {
    return Boolean(entry)
        && typeof entry.fetchedAt === 'number'
        && now - entry.fetchedAt < RATING_CACHE_MAX_AGE
}

export function getCachedRatings(cache) {
    const ratings = {}
    Object.entries(cache).forEach(([id, entry]) => {
        if (typeof entry?.rating === 'number') {
            ratings[id] = entry.rating
        }
    })
    return ratings
}

async function fetchBatch(ids) {
    const response = await fetch(RATINGS_URL, {
        method: 'POST',
        headers: REQUEST_HEADERS,
        body: JSON.stringify({ query: RATINGS_QUERY, variables: { ids } }),
    })
    if (!response.ok) {
        throw new Error(`IMDb ratings request failed with ${response.status}`)
    }

    const data = await response.json()
    const titles = Array.isArray(data?.data?.titles) ? data.data.titles : []
    const ratings = {}

    ids.forEach(id => {
        ratings[id] = null
    })
    titles.forEach(title => {
        const rating = title?.ratingsSummary?.aggregateRating
        if (title?.id && typeof rating === 'number') {
            ratings[title.id] = rating
        }
    })

    return ratings
}

// Resolves to { [id]: rating | null }. A null means IMDb has no rating for the
// title (or the title is unknown), not that the request failed.
export async function requestRatings(ids) {
    const uniqueIds = [...new Set(ids)]
    const ratings = {}

    for (let index = 0; index < uniqueIds.length; index += BATCH_SIZE) {
        const batch = await fetchBatch(uniqueIds.slice(index, index + BATCH_SIZE))
        Object.assign(ratings, batch)
    }

    return ratings
}

export function saveRatings(ratings) {
    const cache = readRatingCache()
    const fetchedAt = Date.now()

    Object.entries(ratings).forEach(([id, rating]) => {
        cache[id] = {
            rating: typeof rating === 'number' ? rating : null,
            fetchedAt,
        }
    })

    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
        // A full or unavailable localStorage only means ratings are re-fetched
        // next time; it should never stop the list from rendering.
    }
}
