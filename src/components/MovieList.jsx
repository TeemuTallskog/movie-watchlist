import React, { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import "../resources/css/MovieList.css"
import MovieCardMenu from './MovieCardMenu';

// Distance from a scroll container edge (px) where a drag starts scrolling it.
const AUTO_SCROLL_EDGE = 28
// Longest distance the list may scroll in a single animation frame.
const AUTO_SCROLL_STEP = 12

const MovieList = ({ movies, containerClass, itemOnClick, deleteMovie, reorderable, moveMovie, movieType, markAsWatched, editReview, ratings, onImageError}) => {
  const [popUpMenu, setPopUpMenu] = useState(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  // { index, after } of the row the pointer is over, plus which half it is on.
  // Row positions are tracked by index: stored movies are not guaranteed to
  // have unique ids, so an id lookup could resolve to the wrong row.
  const [dropTarget, setDropTarget] = useState(null)

  // The dragged row is tracked in a ref as well: dragover fires before the
  // state from dragstart is guaranteed to be committed.
  const dragSourceRef = useRef({ index: -1 })
  const scrollContainerRef = useRef(null)
  const scrollFrameRef = useRef(null)
  const pointerYRef = useRef(0)

  const editMovieMenu = (func, ...args) => {
    setPopUpMenu(null)
    func(...args)
  }

  // Native drag and drop does not auto-scroll a container, so nudge the list
  // towards whichever edge the pointer is closest to.
  const autoScrollStep = () => {
    const container = scrollContainerRef.current
    if (!container) {
      scrollFrameRef.current = null
      return
    }

    const { top, bottom } = container.getBoundingClientRect()
    const pointerY = pointerYRef.current
    let delta = 0

    if (pointerY < top + AUTO_SCROLL_EDGE) {
      const intensity = Math.min((top + AUTO_SCROLL_EDGE - pointerY) / AUTO_SCROLL_EDGE, 1)
      delta = -Math.ceil(intensity * AUTO_SCROLL_STEP)
    } else if (pointerY > bottom - AUTO_SCROLL_EDGE) {
      const intensity = Math.min((pointerY - (bottom - AUTO_SCROLL_EDGE)) / AUTO_SCROLL_EDGE, 1)
      delta = Math.ceil(intensity * AUTO_SCROLL_STEP)
    }

    if (delta !== 0) {
      container.scrollTop += delta
    }

    scrollFrameRef.current = requestAnimationFrame(autoScrollStep)
  }

  const startAutoScroll = (container) => {
    if (!container) {
      return
    }
    scrollContainerRef.current = container
    if (scrollFrameRef.current === null) {
      scrollFrameRef.current = requestAnimationFrame(autoScrollStep)
    }
  }

  const stopAutoScroll = () => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }
    scrollContainerRef.current = null
  }

  const finishDrag = () => {
    dragSourceRef.current = { index: -1 }
    setDraggingIndex(null)
    setDropTarget(null)
    stopAutoScroll()
  }

  const startDrag = (event, movie, index) => {
    // Firefox ignores a drag unless some data is attached to it.
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(movie.id))

    const row = event.currentTarget.closest('.movie-card-list-item')
    if (row) {
      event.dataTransfer.setDragImage(row, 24, 24)
    }

    dragSourceRef.current = { index }
    setDraggingIndex(index)
    setPopUpMenu(null)
  }

  // Which half of the row the pointer is on decides both where the line is
  // drawn and where the dropped row lands.
  const isAfterRow = (event) => {
    const { top, height } = event.currentTarget.getBoundingClientRect()
    return event.clientY > top + height / 2
  }

  const dragOverRow = (event, index) => {
    if (dragSourceRef.current.index < 0) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    pointerYRef.current = event.clientY

    // The scrollable ancestor is the panel content, not this list.
    const scrollContainer = event.currentTarget.closest('.collapsible-content')
    if (scrollContainer) {
      startAutoScroll(scrollContainer)
    }

    if (index === dragSourceRef.current.index) {
      setDropTarget(null)
      return
    }

    const after = isAfterRow(event)
    setDropTarget(prevState => prevState?.index === index && prevState.after === after ? prevState : { index, after })
  }

  const dropOnRow = (event, index) => {
    event.preventDefault()

    const { index: fromIndex } = dragSourceRef.current
    if (fromIndex < 0) {
      return
    }

    // Read the drop position from this event rather than the rendered state:
    // React can defer the re-render triggered by the last dragover.
    const after = isAfterRow(event)
    finishDrag()

    if (!moveMovie || index === fromIndex) {
      return
    }

    // Dropping just above or just below its own slot leaves the order alone.
    const slot = index + (after ? 1 : 0)
    if (slot === fromIndex || slot === fromIndex + 1) {
      return
    }

    moveMovie(fromIndex, slot)
  }

  // Moving onto a child fires dragleave with a related target still inside the
  // list, so only clear the indicator when the pointer really left it.
  const leaveList = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDropTarget(null)
    }
  }

  const rowClassName = (index) => {
    const classes = ['movie-card-list-item']
    if (draggingIndex === index) {
      classes.push('is-dragging')
    }
    if (dropTarget?.index === index) {
      classes.push(dropTarget.after ? 'drop-after' : 'drop-before')
    }
    return classes.join(' ')
  }

  return (
    <div className={containerClass}>
      <ul className='movie-card-list-ul' onDragLeave={leaveList}>
        {movies.map(( movie, index ) => (
          <li className={rowClassName(index)} key={movie.id} onClick={ itemOnClick ? () => itemOnClick(movie) : () => {}} onDragOver={(event) => dragOverRow(event, index)} onDrop={(event) => dropOnRow(event, index)}>
            {reorderable ? (
              <span
                className='drag-handle unicode'
                draggable
                aria-hidden="true"
                title="Drag to reorder"
                onDragStart={(event) => startDrag(event, movie, index)}
                onDragEnd={finishDrag}
              >&#x283F;</span>
            ) : null}
            <MovieCard movie={movie} imdbRating={ratings?.[movie.id]} onImageError={onImageError} button={ deleteMovie ? <button type="button" className="unicode" onClick={() => setPopUpMenu(state => state === movie.id ? null : movie.id)}>&#8942;</button> : null }/>
            {popUpMenu === movie.id && <MovieCardMenu movie={movie} deleteFunction={deleteMovie} deleteType={movieType} markAsWatched={markAsWatched ? markAsWatched : null} editReview={editReview ? editReview : null} wrapperFunction={editMovieMenu}/>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieList;
