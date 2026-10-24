import React from 'react';
import "../resources/css/MovieCard.css"

function addImageUrlMaxHeight(url){
    // Add AWS media API parameter to return smaller resolution images for faster loading times.
    // _SY50_ Limits the max height of images returned from the api to 50px
    // Reference: https://stackoverflow.com/questions/73089650/what-are-the-parameters-for-aws-media-amazon-image-hosting
    return url.replace("@._V1_.jpg", "@._V1_SY50_.jpg")
}

function MovieCard({ movie, button }){
    return(
        <div className="movie-card-container">
            { movie.i ? <a href={movie.i.imageUrl ? movie.i.imageUrl : "" }><img src={ movie.i.imageUrl ? addImageUrlMaxHeight(movie.i.imageUrl) : "N/A" } alt={movie.l}/></a> : <></> }
            <div className="movie-card-container-title">
                <a href={ "https://www.imdb.com/title/" + movie.id }>{movie.l}</a>
                <p>{movie.y}</p>
            </div>
            {button}
        </div>
    )
}

export default MovieCard;