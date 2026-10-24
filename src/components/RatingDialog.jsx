import React, { useEffect, useRef, useState } from 'react'
import StarRating from './StarRating'
import ImdbLogo from '../resources/icons/imdb.svg'
import '../resources/css/RatingDialog.css'

const MAX_REVIEW_LENGTH = 200

function RatingDialog({ movie, mode, imdbRating, onCancel, onSubmit }) {
    const dialogRef = useRef(null)
    const [rating, setRating] = useState(movie?.review?.rating ?? 0)
    const [notes, setNotes] = useState(movie?.review?.text ?? '')

    const hasImdbRating = typeof imdbRating === 'number' && Number.isFinite(imdbRating)
    const isEditing = mode === 'edit'

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog || dialog.open) {
            return
        }

        dialog.showModal()
        // Native dialogs focus their first focusable element (the close
        // button); start on the stars instead so rating is one keypress away.
        dialog.querySelector('.star-button[tabindex="0"]')?.focus()
    }, [])

    const close = () => {
        dialogRef.current?.close()
        onCancel()
    }

    const handleNativeCancel = (event) => {
        // Escape: close through React state as well so the dialog unmounts.
        event.preventDefault()
        close()
    }

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            close()
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSubmit({ rating, text: notes.trim() })
        dialogRef.current?.close()
    }

    return (
        <dialog
            ref={dialogRef}
            className="rating-dialog"
            aria-labelledby="rating-dialog-title"
            onCancel={handleNativeCancel}
            onClick={handleBackdropClick}
        >
            <form className="rating-dialog-form" onSubmit={handleSubmit}>
                <header className="rating-dialog-header">
                    <div className="rating-dialog-heading">
                        <h2 id="rating-dialog-title">{isEditing ? 'Rating & notes' : 'Mark as watched'}</h2>
                        <p className="rating-dialog-movie">
                            <span className="rating-dialog-movie-title">{movie?.l}</span>
                            {movie?.y ? <span>{movie.y}</span> : null}
                            {hasImdbRating ? (
                                <span className="rating-dialog-imdb">
                                    <img src={ImdbLogo} alt="" aria-hidden="true" />
                                    <span>IMDb {imdbRating.toFixed(1)}</span>
                                </span>
                            ) : null}
                        </p>
                    </div>
                    <button type="button" className="rating-dialog-close" aria-label="Close" onClick={close}>
                        &times;
                    </button>
                </header>

                <div className="rating-dialog-body">
                    <div className="rating-dialog-field">
                        <div className="rating-dialog-label-row">
                            <span id="rating-dialog-stars-label">Your rating</span>
                            <span className="rating-dialog-value">{rating > 0 ? `${rating}/10` : 'Not rated'}</span>
                        </div>
                        <StarRating
                            value={rating}
                            placeholder={hasImdbRating ? imdbRating : undefined}
                            onChange={setRating}
                            labelId="rating-dialog-stars-label"
                        />
                        <div className="rating-dialog-hint">
                            <span>
                                {hasImdbRating
                                    ? 'Dimmed stars show the IMDb rating.'
                                    : 'Pick from 0 to 10 stars.'}
                            </span>
                            {rating > 0 ? (
                                <button type="button" className="rating-dialog-clear" onClick={() => setRating(0)}>
                                    Clear
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <label className="rating-dialog-field" htmlFor="rating-dialog-notes">
                        <span className="rating-dialog-label-row">
                            <span>Your notes</span>
                            <span className="rating-dialog-optional">optional</span>
                        </span>
                        <textarea
                            id="rating-dialog-notes"
                            value={notes}
                            onChange={event => setNotes(event.target.value)}
                            rows={4}
                            maxLength={MAX_REVIEW_LENGTH}
                            placeholder="What did you think?"
                        />
                        <span className="rating-dialog-counter">
                            {notes.length}/{MAX_REVIEW_LENGTH}
                        </span>
                    </label>

                    <p className="rating-dialog-local-note">
                        Your rating and notes stay local in your browser.
                    </p>
                </div>

                <footer className="rating-dialog-footer">
                    <button type="button" className="rating-dialog-button rating-dialog-button--secondary" onClick={close}>
                        Cancel
                    </button>
                    <button type="submit" className="rating-dialog-button rating-dialog-button--primary">
                        {isEditing ? 'Save' : 'Mark as watched'}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}

export default RatingDialog
