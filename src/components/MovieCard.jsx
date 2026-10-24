import React, { useEffect, useState } from 'react';
import { addImageUrlMaxHeight } from '../utils/movieImage';
import ImdbLogo from '../resources/icons/imdb.svg';
import ReviewNote from './ReviewNote';
import "../resources/css/MovieCard.css"

function MovieCard({ movie, button, onImageError, imdbRating }){
    const imageUrl = movie.i?.imageUrl
    const [imageFailed, setImageFailed] = useState(false)

    // A refreshed URL arrives via props; clear the failure so it is rendered.
    useEffect(() => {
        setImageFailed(false)
    }, [imageUrl])

    const handleImageError = () => {
        setImageFailed(true)
        if (onImageError) {
            onImageError(movie)
        }
    }

    const hasImdbRating = typeof imdbRating === 'number' && Number.isFinite(imdbRating)
    const userRating = typeof movie.review?.rating === 'number' ? movie.review.rating : 0
    const reviewText = typeof movie.review?.text === 'string' ? movie.review.text.trim() : ''

    return(
        <div className="movie-card-container">
            { imageUrl && !imageFailed ? <a href={imageUrl}><img className="movie-card-poster" src={addImageUrlMaxHeight(imageUrl)} alt={movie.l} onError={handleImageError}/></a> : null }
            <div className="movie-card-container-title">
                <a href={ "https://www.imdb.com/title/" + movie.id }>{movie.l}</a>
                <div className="movie-card-meta">
                    {movie.y ? <span className="movie-card-year">{movie.y}</span> : null}
                    {hasImdbRating ? (
                        <span className="movie-card-imdb" role="img" aria-label={`IMDb rating ${imdbRating.toFixed(1)} out of 10`}>
                            <img src={ImdbLogo} alt="" aria-hidden="true" />
                            <span aria-hidden="true">{imdbRating.toFixed(1)}/10</span>
                        </span>
                    ) : null}
                    {userRating > 0 ? (
                        <span className="movie-card-user-rating" role="img" aria-label={`Your rating ${userRating} out of 10`}>
                            <span aria-hidden="true">&#9733;</span>
                            <span aria-hidden="true">{userRating}/10</span>
                        </span>
                    ) : null}
                </div>
                {reviewText ? <ReviewNote text={reviewText} /> : null}
            </div>
            {button}
        </div>
    )
}

export default MovieCard;
