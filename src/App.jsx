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
import { readStoredMovies } from './utils/movieStorage';

function App() {
  const [movies, setMovies] = useState([])
  const [watchedMovies, setWatchedMovies] = useState([])
  const imdbRatings = useImdbRatings(movies, watchedMovies)
  // { movie, mode: 'watch' | 'edit' } while the rating dialog is open.
  const [reviewDialog, setReviewDialog] = useState(null)
  // Only one of 'search' | 'watchlist' | 'watched' can be open at a time;
  // opening one collapses the others.
  const [openSection, setOpenSection] = useState('watchlist')
  // Display-only sort choices; the storage arrays keep their manual order.
  const [watchlistSort, setWatchlistSort] = useState('custom')
  const [watchlistDirection, setWatchlistDirection] = useState('desc')
  const [watchedSort, setWatchedSort] = useState('recent')
  const [watchedDirection, setWatchedDirection] = useState('desc')
  useEffect(() => {
    setMovies(readStoredMovies('Movies'));
    setWatchedMovies(readStoredMovies('Watched Movies'));
  }, []);

  // Runtime-only lookup handed to the search results: which local list holds
  // each movie id. Watched wins when legacy data has the same id in both
  // lists, since watched is the further-along state.
  const localById = useMemo(() => {
    const byId = new Map()
    movies.forEach(movie => { if (movie?.id) byId.set(movie.id, { movie, list: 'watchlist' }) })
    watchedMovies.forEach(movie => { if (movie?.id) byId.set(movie.id, { movie, list: 'watched' }) })
    return byId
  }, [movies, watchedMovies]);

  // Toggle one section open; clicking the open section collapses it back
  // to none, and opening one section collapses the others.
  const openOne = (section) =>
    setOpenSection(prev => (prev === section ? null : section))

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

  // Enriched copies of stored movies flow through the UI (search results show
  // local data); resolve the pristine stored entry so nothing runtime-only is
  // persisted and stored data wins over stale search-API data.
  const findStoredMovie = (movie, storages) => {
    for (const storage of storages) {
      const stored = readStoredMovies(storage).find(item => item.id === movie?.id)
      if (stored) {
        return stored
      }
    }
    return movie
  }

  const markAsWatched = (movie, review) => {
    const storedMovie = findStoredMovie(movie, ['Movies', 'Watched Movies'])
    deleteMovie(storedMovie, 'Movies')
    const watchedEntry = { ...storedMovie, review: { ...review, updatedAt: Date.now() } }
    const updatedWatched = readStoredMovies('Watched Movies')
    const updatedList = [watchedEntry, ...updatedWatched]
    localStorage.setItem("Watched Movies", JSON.stringify(updatedList))
    setWatchedMovies(updatedList)
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
      <MovieSearch
        setMovies={setMovies}
        localById={localById}
        deleteMovie={deleteMovie}
        markAsWatched={movie => setReviewDialog({ movie, mode: 'watch' })}
        editReview={movie => setReviewDialog({ movie, mode: 'edit' })}
        open={openSection === 'search'}
        onOpenChange={open => open
          // Opening the search takes over from any open list...
          ? setOpenSection('search')
          // ...and closing it must not activate the search section
          // behind the search bar's own outside-click listener; it only
          // clears the state when a list wasn't opened instead.
          : setOpenSection(prev => (prev === 'search' ? null : prev))}
      />
      <div className='watchlist-content'>
        <Collapsible
          title="Watchlist"
          open={openSection === 'watchlist'}
          onToggle={() => openOne('watchlist')}
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
          open={openSection === 'watched'}
          onToggle={() => openOne('watched')}
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

