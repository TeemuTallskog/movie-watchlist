import React, { useState } from 'react';
import MovieCard from './MovieCard';
import "../resources/css/MovieList.css"
import MovieCardMenu from './MovieCardMenu';

const MovieList = ({ movies, containerClass, itemOnClick, deleteMovie, shiftPosition, movieType, markAsWatched}) => {
  const [popUpMenu, setPopUpMenu] = useState(null)
  const editMovieMenu = (func, ...args) => {
    setPopUpMenu(null)
    func(...args)
  }

  return (
    <div className={containerClass}>
      <ul className='movie-card-list-ul'>
        {movies.map(( movie, index ) => (
          <li className='movie-card-list-item' key={movie.id} onClick={ itemOnClick ? () => itemOnClick(movie) : () => {}}>
            {movieType === "Movies" ? <div className='sort-button-container'>
              <button type='button' className='sort-button unicode' onClick={() => shiftPosition(index, -1)}>&#x25B2;</button>
              <button type='button' className='sort-button unicode' onClick={() => shiftPosition(index, 1)}>&#x25BC;</button>
            </div> : null}
            <MovieCard movie={movie} button={ deleteMovie ? <button type="button" className="unicode" onClick={() => setPopUpMenu(state => state === index ? null : index)}>&#8942;</button> : null }/>
            {popUpMenu === index && <MovieCardMenu movie={movie} deleteFunction={deleteMovie} deleteType={movieType} markAsWatched={markAsWatched ? markAsWatched : null} wrapperFunction={editMovieMenu}/>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieList;
