const SUGGESTION_URL = 'https://v3.sg.media-imdb.com/suggestion/titles/x/'

// A poster refresh is attempted at most once per movie for the lifetime of the
// popup (the module is re-evaluated when the extension is reopened). This keeps
// remounting cards from repeatedly hitting the suggestion API for an image that
// could not be recovered.
const attempted = new Set()
const inFlight = new Map()
const resolved = new Map()

// Add an AWS media API parameter to return smaller resolution images for faster
// loading times. `_SY50_` limits the max height of images returned from the API
// to 50px.
// Reference: https://stackoverflow.com/questions/73089650/what-are-the-parameters-for-aws-media-amazon-image-hosting
export function addImageUrlMaxHeight(url) {
    if (!url) {
        return url
    }
    // Handles both `@._V1_.jpg` and URLs that already contain transform
    // segments such as `@._V1_QL75_UX380_CR0,0,380,562_.jpg`.
    return url.replace(/@\._V1_.*?(\.(?:jpe?g|png|webp))(\?.*)?$/i, '@._V1_SY50_$1$2')
}

async function requestPosterUrl(movieId) {
    try {
        const response = await fetch(`${SUGGESTION_URL}${encodeURIComponent(movieId)}.json`)
        if (!response.ok) {
            return null
        }
        const data = await response.json()
        const match = Array.isArray(data?.d)
            ? data.d.find(item => item.id === movieId && item.i?.imageUrl)
            : null
        return match?.i?.imageUrl ?? null
    } catch {
        return null
    }
}

export function fetchPosterUrl(movieId) {
    if (!movieId) {
        return Promise.resolve(null)
    }
    if (resolved.has(movieId)) {
        return Promise.resolve(resolved.get(movieId))
    }
    if (inFlight.has(movieId)) {
        return inFlight.get(movieId)
    }
    if (attempted.has(movieId)) {
        return Promise.resolve(null)
    }

    attempted.add(movieId)
    const request = requestPosterUrl(movieId)
        .then(imageUrl => {
            if (imageUrl) {
                resolved.set(movieId, imageUrl)
            }
            return imageUrl
        })
        .finally(() => {
            inFlight.delete(movieId)
        })
    inFlight.set(movieId, request)
    return request
}
