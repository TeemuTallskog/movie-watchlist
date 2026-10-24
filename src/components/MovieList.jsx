import React, { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import "../resources/css/MovieList.css"
import MovieCardMenu from './MovieCardMenu';

// Distance from a scroll container edge (px) where a drag starts scrolling it.
const AUTO_SCROLL_EDGE = 28
// Longest distance the list may scroll in a single animation frame.
const AUTO_SCROLL_STEP = 12

// Height the popover reaches below its row (menu + margins), used to keep it
// visible when the row sits near the bottom of a scroll container.
const MENU_PROJECTION = 180

const MovieList = ({ movies, containerClass, itemOnClick, deleteMovie, reorderable, moveMovie, movieType, sortMode, markAsWatched, editReview, ratings, onImageError, listById}) => {
  // DnD works on storage-array indexes, so it is only valid when the displayed
  // order equals the storage order.
  const canReorder = Boolean(reorderable) && sortMode === 'custom'
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

  // Nudge the list's own scroll so a popover opened from the bottom of the
  // dropdown stays inside the scrolling container.
  const revealMenuBelow = (button) => {
    const row = button.closest('.movie-card-list-item')
    const list = row?.closest('.movie-card-list-ul')
    if (!row || !list) {
      return
    }
    const overflow = row.getBoundingClientRect().bottom + MENU_PROJECTION - list.getBoundingClientRect().bottom
    if (overflow > 0) {
      list.scrollTop += Math.ceil(overflow)
    }
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
    if (!canReorder || dragSourceRef.current.index < 0) {
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

    if (!canReorder) {
      return
    }

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

  const rowClassName = (index, variant) => {
    const classes = ['movie-card-list-item']
    if (variant) {
      classes.push(`movie-card-list-item--${variant}`)
    }
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
        {movies.map(( movie, index ) => {
          // Search rows know which local list they belong to (listById); by
          // definition they are already saved, so clicking them is a no-op
          // and the menu carries that list's actions instead.
          const variant = listById?.get(movie.id) || null
          const rowMenu = variant
            ? {
                deleteType: variant === 'watched' ? 'Watched Movies' : 'Movies',
                markAsWatched: variant === 'watchlist' ? markAsWatched : null,
                editReview: variant === 'watched' ? editReview : null,
              }
            : { deleteType: movieType, markAsWatched, editReview }
          const menuButton = deleteMovie
            ? <button type="button" className="unicode" onClick={(event) => {
                setPopUpMenu(state => state === movie.id ? null : movie.id)
                // The search dropdown scrolls and can clip the absolutely
                // positioned menu; the library panels overflow visibly.
                if (containerClass) {
                  revealMenuBelow(event.currentTarget)
                }
              }}>&#8942;</button>
            : null
          // In search mode only rows backed by a local list act as list
          // members; library lists (no listById) render their own button.
          const cardButton = listById ? (variant ? menuButton : null) : menuButton
          return (
          <li className={rowClassName(index, variant)} key={movie.id} onClick={ itemOnClick ? () => itemOnClick(movie) : () => {}} onDragOver={(event) => dragOverRow(event, index)} onDrop={(event) => dropOnRow(event, index)}>
            {canReorder ? (
              <span
                className='drag-handle unicode'
                draggable
                aria-hidden="true"
                title="Drag to reorder"
                onDragStart={(event) => startDrag(event, movie, index)}
                onDragEnd={finishDrag}
              >&#x283F;</span>
            ) : null}
            <MovieCard movie={movie} imdbRating={ratings?.[movie.id]} onImageError={onImageError} button={ cardButton }/>
            {popUpMenu === movie.id && <MovieCardMenu movie={movie} deleteFunction={deleteMovie} deleteType={rowMenu.deleteType} markAsWatched={rowMenu.markAsWatched ? rowMenu.markAsWatched : null} editReview={rowMenu.editReview ? rowMenu.editReview : null} wrapperFunction={editMovieMenu}/>}
          </li>
          )
        })}
      </ul>
    </div>
  );
};

export default MovieList;
