import React from 'react';
import MovieCard from './MovieCard';
import "../resources/css/MovieList.css"

const MovieList = ({ movies, containerClass, itemOnClick, deleteMovie }) => {

  return (
    <div className={containerClass}>
      <ul>
        {movies.map(( movie ) => (
          <li key={movie.id} onClick={ itemOnClick ? () => itemOnClick(movie) : () => {}}>
            <MovieCard movie={movie} button={ deleteMovie ? <button type="button" onClick={() => deleteMovie(movie)}>X</button> : null }/>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieList;
