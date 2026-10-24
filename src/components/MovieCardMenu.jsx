import React from 'react';

const MovieCardMenu = ({movie, deleteFunction, deleteType, markAsWatched, editReview, wrapperFunction}) => {
    return (
        // Menu clicks must not reach the row's onClick: in the search
        // dropdown that click would re-save a just-deleted movie.
        <div className='movie-card-menu-container' onClick={event => event.stopPropagation()}>
            {markAsWatched ? <button onClick={() => wrapperFunction(markAsWatched, movie)}>Mark as watched</button> : null}
            {editReview ? <button onClick={() => wrapperFunction(editReview, movie)}>{movie.review ? 'Edit rating & notes' : 'Rate & add notes'}</button> : null}
            <button className='deleteButton' onClick={() => wrapperFunction(deleteFunction, movie, deleteType)}>Delete</button>
        </div>
    )
}

export default MovieCardMenu;