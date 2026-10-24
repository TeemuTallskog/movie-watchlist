import React, { useEffect, useState } from 'react';
import { addImageUrlMaxHeight } from '../utils/movieImage';
import "../resources/css/MovieCard.css"

function MovieCard({ movie, button, onImageError }){
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

    return(
        <div className="movie-card-container">
            { imageUrl && !imageFailed ? <a href={imageUrl}><img src={addImageUrlMaxHeight(imageUrl)} alt={movie.l} onError={handleImageError}/></a> : null }
            <div className="movie-card-container-title">
                <a href={ "https://www.imdb.com/title/" + movie.id }>{movie.l}</a>
                <p>{movie.y}</p>
            </div>
            {button}
        </div>
    )
}

export default MovieCard;
