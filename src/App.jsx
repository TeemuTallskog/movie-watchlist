// src/App.js
import React, { useState, useEffect } from 'react';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import Collapsible from './components/Collapsible';
import { fetchPosterUrl } from './utils/movieImage';

const readStoredMovies = (storage) => {
  try {
    return JSON.parse(localStorage.getItem(storage)) || []
  } catch {
    return []
  }
}

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

  // `toIndex` is the slot in the current array the movie should land in, so it
  // is read before the movie is removed: taking it out shifts later slots down.
  const moveMovie = (fromIndex, toIndex) => {
    const isOutOfRange = (index, length) => index < 0 || index > length
    if (fromIndex === toIndex || isOutOfRange(fromIndex, movies.length - 1) || isOutOfRange(toIndex, movies.length)){
      return
    }

    const newArr = [...movies]
    const [movedMovie] = newArr.splice(fromIndex, 1)
    newArr.splice(fromIndex < toIndex ? toIndex - 1 : toIndex, 0, movedMovie)

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

  const replaceMovieImage = (movieId, imageUrl) => {
    [
      { storage: 'Movies', setTarget: setMovies },
      { storage: 'Watched Movies', setTarget: setWatchedMovies },
    ].forEach(({ storage, setTarget }) => {
      const storedMovies = readStoredMovies(storage)
      let changed = false

      const updatedMovies = storedMovies.map(movie => {
        if (movie.id !== movieId || movie.i?.imageUrl === imageUrl) {
          return movie
        }
        changed = true
        return { ...movie, i: { ...(movie.i || {}), imageUrl } }
      })

      if (changed) {
        localStorage.setItem(storage, JSON.stringify(updatedMovies))
        setTarget(updatedMovies)
      }
    })
  }

  const refreshMovieImage = async (movie) => {
    if (!movie?.id) {
      return
    }

    const imageUrl = await fetchPosterUrl(movie.id)
    if (!imageUrl || imageUrl === movie.i?.imageUrl) {
      return
    }

    replaceMovieImage(movie.id, imageUrl)
  }

  return (
    <div className="App">
      <MovieSearch setMovies={setMovies}/>
      <div className='watchlist-content'>
        <Collapsible title="Watchlist" open={true} itemCount={movies.length} variant="watchlist">
          <MovieList movies={movies} deleteMovie={deleteMovie} movieType="Movies" reorderable={true} moveMovie={moveMovie} markAsWatched={markAsWatched} onImageError={refreshMovieImage}/>
        </Collapsible>
        <Collapsible title="Watched" open={false} itemCount={watchedMovies.length} variant="watched">
          <MovieList movies={watchedMovies} deleteMovie={deleteMovie} movieType="Watched Movies" onImageError={refreshMovieImage}/>
        </Collapsible>
      </div>
    </div>
  );
}

export default App;

