import React, { useRef, useState } from 'react'

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// A 0-10 star picker. `placeholder` is IMDb's rating: it is painted behind the
// user's selection as dimmed stars, including a partially filled last star.
function StarRating({ value, placeholder, onChange, labelId }) {
    const [hovered, setHovered] = useState(null)
    const buttonsRef = useRef([])

    const previewValue = hovered ?? value
    const focusStar = value > 0 ? value : 1

    const placeholderFill = (star) => {
        if (typeof placeholder !== 'number' || !Number.isFinite(placeholder)) {
            return 0
        }
        return Math.min(1, Math.max(0, placeholder - (star - 1)))
    }

    const handleKeyDown = (event) => {
        const current = value > 0 ? value : 1
        let next = null

        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            next = Math.min(current + 1, 10)
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            next = Math.max(current - 1, 1)
        } else if (event.key === 'Home') {
            next = 1
        } else if (event.key === 'End') {
            next = 10
        }

        if (next === null) {
            return
        }

        event.preventDefault()
        onChange(next)
        buttonsRef.current[next - 1]?.focus()
    }

    const handleClick = (star) => {
        onChange(value === star ? 0 : star)
        // Show the committed value, not a stale hover preview (e.g. after
        // clicking the selected star to clear the rating).
        setHovered(null)
    }

    return (
        <div className="star-rating" role="radiogroup" aria-labelledby={labelId} onMouseLeave={() => setHovered(null)}>
            {STARS.map(star => (
                <button
                    key={star}
                    ref={element => { buttonsRef.current[star - 1] = element }}
                    type="button"
                    role="radio"
                    aria-checked={value === star}
                    aria-label={`Rate ${star} out of 10`}
                    className="star-button"
                    tabIndex={star === focusStar ? 0 : -1}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => setHovered(star)}
                    onKeyDown={handleKeyDown}
                >
                    <span className="star-glyph" aria-hidden="true">&#9733;</span>
                    {placeholderFill(star) > 0 ? (
                        <span
                            className="star-layer star-layer--imdb"
                            style={{ width: `${placeholderFill(star) * 100}%` }}
                            aria-hidden="true"
                        >
                            <span className="star-glyph">&#9733;</span>
                        </span>
                    ) : null}
                    {star <= previewValue ? (
                        <span className="star-layer star-layer--user" aria-hidden="true">
                            <span className="star-glyph">&#9733;</span>
                        </span>
                    ) : null}
                </button>
            ))}
        </div>
    )
}

export default StarRating
