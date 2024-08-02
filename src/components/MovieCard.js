import React from 'react';
import "../resources/css/MovieCard.css"

function MovieCard({ movie, button }){
    return(
        <div className="movie-card-container">
            { movie.i ? <img src={ movie.i.imageUrl ? movie.i.imageUrl : "N/A" } alt={movie.l}/> : <></> }
            <div className="movie-card-container-title">
                <a href={ "https://www.imdb.com/title/" + movie.id }>{movie.l}</a>
                <p>{movie.y}</p>
            </div>
            {button}
        </div>
    )
}

export default MovieCard;