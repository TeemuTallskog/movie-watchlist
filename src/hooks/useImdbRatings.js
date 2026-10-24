import { useEffect, useMemo, useState } from 'react'
import {
    getCachedRatings,
    isCacheEntryFresh,
    readRatingCache,
    requestRatings,
    saveRatings,
} from '../utils/imdbRating'

// StrictMode runs effects twice in development. Track request ids at module
// level so the second pass does not send the same batch again.
const fetchingIds = new Set()

export function useImdbRatings(movies, watchedMovies) {
    const [ratings, setRatings] = useState(() => getCachedRatings(readRatingCache()))

    const ids = useMemo(() => {
        const seen = new Set()
        const result = []

        ;[...movies, ...watchedMovies].forEach(movie => {
            const id = movie?.id
            if (id && !seen.has(id)) {
                seen.add(id)
                result.push(id)
            }
        })

        return result
    }, [movies, watchedMovies])

    const idsKey = ids.join('|')

    useEffect(() => {
        if (!idsKey) {
            return
        }

        const now = Date.now()
        const cache = readRatingCache()
        const staleIds = idsKey
            .split('|')
            .filter(id => !isCacheEntryFresh(cache[id], now) && !fetchingIds.has(id))

        if (staleIds.length === 0) {
            return
        }

        staleIds.forEach(id => fetchingIds.add(id))

        requestRatings(staleIds)
            .then(fetchedRatings => {
                saveRatings(fetchedRatings)

                const knownRatings = {}
                Object.entries(fetchedRatings).forEach(([id, rating]) => {
                    if (typeof rating === 'number') {
                        knownRatings[id] = rating
                    }
                })

                if (Object.keys(knownRatings).length > 0) {
                    setRatings(previous => ({ ...previous, ...knownRatings }))
                }
            })
            .catch(() => {
                // No badge is shown for this session; the next open retries.
            })
            .finally(() => {
                staleIds.forEach(id => fetchingIds.delete(id))
            })
    }, [idsKey])

    return ratings
}
