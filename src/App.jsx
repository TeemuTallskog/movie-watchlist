// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import MovieList from './components/MovieList';
import MovieSearch from './components/MovieSearch';
import Collapsible from './components/Collapsible';
import SortControl from './components/SortControl';
import RatingDialog from './components/RatingDialog';
import { fetchPosterUrl } from './utils/movieImage';
import { useImdbRatings } from './hooks/useImdbRatings';
import { sortMovies } from './utils/sorting';

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
  const imdbRatings = useImdbRatings(movies, watchedMovies)
  // { movie, mode: 'watch' | 'edit' } while the rating dialog is open.
  const [reviewDialog, setReviewDialog] = useState(null)
  // Display-only sort choices; the storage arrays keep their manual order.
  const [watchlistSort, setWatchlistSort] = useState('custom')
  const [watchlistDirection, setWatchlistDirection] = useState('desc')
  const [watchedSort, setWatchedSort] = useState('recent')
  const [watchedDirection, setWatchedDirection] = useState('desc')
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

  const markAsWatched = (movie, review) => {
    deleteMovie(movie, 'Movies')
    const storedWatched = readStoredMovies('Watched Movies');
    const watchedEntry = { ...movie, review: { ...review, updatedAt: Date.now() } }
    const updatedWatched = [watchedEntry, ...storedWatched]
    localStorage.setItem("Watched Movies", JSON.stringify(updatedWatched))
    setWatchedMovies(updatedWatched)
  }

  const saveReview = (movie, review) => {
    const updatedWatched = readStoredMovies('Watched Movies').map(item => (
      item.id === movie.id
        ? { ...item, review: { ...review, updatedAt: Date.now() } }
        : item
    ))
    localStorage.setItem("Watched Movies", JSON.stringify(updatedWatched))
    setWatchedMovies(updatedWatched)
  }

  const submitReview = (review) => {
    if (!reviewDialog) {
      return
    }
    if (reviewDialog.mode === 'watch') {
      markAsWatched(reviewDialog.movie, review)
    } else {
      saveReview(reviewDialog.movie, review)
    }
    setReviewDialog(null)
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

  const sortedWatchlist = useMemo(
    () => sortMovies(movies, watchlistSort, watchlistDirection, imdbRatings),
    [movies, watchlistSort, watchlistDirection, imdbRatings]
  )

  const sortedWatched = useMemo(
    () => sortMovies(watchedMovies, watchedSort, watchedDirection, imdbRatings),
    [watchedMovies, watchedSort, watchedDirection, imdbRatings]
  )

  const watchlistSortOptions = [
    { value: 'custom', label: 'Custom' },
    { value: 'imdb', label: 'Rating' },
    { value: 'year', label: 'Year' },
  ]

  const watchedSortOptions = [
    { value: 'recent', label: 'Recent' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'imdb', label: 'IMDb rating' },
    { value: 'personal', label: 'Personal rating' },
    { value: 'year', label: 'Year' },
  ]

  return (
    <div className="App">
      <MovieSearch setMovies={setMovies}/>
      <div className='watchlist-content'>
        <Collapsible
          title="Watchlist"
          open={true}
          itemCount={movies.length}
          variant="watchlist"
          headerExtra={
            <SortControl
              options={watchlistSortOptions}
              sort={watchlistSort}
              setSort={setWatchlistSort}
              direction={watchlistDirection}
              setDirection={setWatchlistDirection}
            />
          }
        >
          <MovieList movies={sortedWatchlist} deleteMovie={deleteMovie} movieType="Movies" reorderable={true} moveMovie={moveMovie} sortMode={watchlistSort} markAsWatched={movie => setReviewDialog({ movie, mode: 'watch' })} ratings={imdbRatings} onImageError={refreshMovieImage}/>
        </Collapsible>
        <Collapsible
          title="Watched"
          open={false}
          itemCount={watchedMovies.length}
          variant="watched"
          headerExtra={
            <SortControl
              options={watchedSortOptions}
              sort={watchedSort}
              setSort={setWatchedSort}
              direction={watchedDirection}
              setDirection={setWatchedDirection}
            />
          }
        >
          <MovieList movies={sortedWatched} deleteMovie={deleteMovie} movieType="Watched Movies" sortMode={watchedSort} editReview={movie => setReviewDialog({ movie, mode: 'edit' })} ratings={imdbRatings} onImageError={refreshMovieImage}/>
        </Collapsible>
      </div>
      {reviewDialog ? (
        <RatingDialog
          key={`${reviewDialog.mode}-${reviewDialog.movie.id}`}
          movie={reviewDialog.movie}
          mode={reviewDialog.mode}
          imdbRating={imdbRatings[reviewDialog.movie.id]}
          onCancel={() => setReviewDialog(null)}
          onSubmit={submitReview}
        />
      ) : null}
    </div>
  );
}

export default App;

