// src/App.js
import React, { useState, useEffect } from 'react';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import Collapsible from './components/Collapsible';

function App() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const savedMovies = JSON.parse(localStorage.getItem('Movies')) || [];
    setMovies(savedMovies);
  }, []);

  const deleteMovie = (movie) => {
    const filteredList = movies.filter(item => item.id !== movie.id)
    localStorage.setItem('Movies', JSON.stringify(filteredList));
    setMovies(filteredList)
  }

  return (
    <div className="App">
      <MovieSearch setMovies={setMovies}/>
      <Collapsible title="Watchlist">
        <MovieList movies={movies} deleteMovie={deleteMovie}/>
      </Collapsible>
    </div>
  );
}

export default App;

