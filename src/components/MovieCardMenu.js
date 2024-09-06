import React from 'react';

const MovieCardMenu = ({movie, deleteFunction, deleteType, markAsWatched, wrapperFunction}) => {
    return (
        <div className='movie-card-menu-container'>
            {markAsWatched ? <button onClick={() => wrapperFunction(markAsWatched, movie)}>Mark as watched</button> : null}
            <button onClick={() => wrapperFunction(deleteFunction, movie, deleteType)}>Delete</button>
        </div>
    )
}

export default MovieCardMenu;