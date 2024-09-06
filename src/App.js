// src/App.js
import React, { useState, useEffect } from 'react';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import Collapsible from './components/Collapsible';

function App() {
  const [movies, setMovies] = useState([])
  const [watchedMovies, setWatchedMovies] = useState([])
  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem('Movies')) || [];
    setMovies(savedMovies);

    const watchedMovies = JSON.parse(localStorage.getItem('Watched Movies')) || [];
    setWatchedMovies(watchedMovies)
  }, []);

  const deleteMovie = (movie, storage = 'Movies') => {
    let target = null
    let setTarget = null
    if (storage === 'Movies'){
      target = movies
      setTarget = setMovies
    }else if (storage === 'Watched Movies'){
      target = watchedMovies
      setTarget = setWatchedMovies
    }
    if(!target || !setTarget){
      return
    }
    const filteredList = target.filter(item => item.id !== movie.id)
    localStorage.setItem(storage, JSON.stringify(filteredList));
    setTarget(filteredList)
  }

  const shiftMovieIndex = (movieIndex, position) => {
    if ((movieIndex + position) < 0 || (movieIndex + position) >= movies.length){
      return
    }

    const newArr = [...movies];
    const temp = movies[movieIndex];
    newArr[movieIndex] = newArr[(movieIndex + position)]
    newArr[(movieIndex + position)] = temp

    setMovies(newArr);
    localStorage.setItem('Movies', JSON.stringify(newArr));
  }

  const markAsWatched = (movie) => {
    deleteMovie(movie, 'Movies')
    const watchedMovies = JSON.parse(localStorage.getItem('Watched Movies')) || [];
    watchedMovies.unshift(movie)
    localStorage.setItem("Watched Movies", JSON.stringify(watchedMovies))
    setWatchedMovies(watchedMovies)
  }

  return (
    <div className="App">
      <MovieSearch setMovies={setMovies}/>
      <Collapsible title="Watchlist" open={true} >
        <MovieList movies={movies} deleteMovie={deleteMovie} movieType="Movies" shiftPosition={shiftMovieIndex} markAsWatched={markAsWatched}/>
      </Collapsible>
      <Collapsible title="Watched" open={false}>
        <MovieList movies={watchedMovies} deleteMovie={deleteMovie} movieType="Watched Movies"/>
      </Collapsible>
    </div>
  );
}

export default App;

