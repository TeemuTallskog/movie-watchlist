import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Delay hiding briefly so the pointer can cross the gap between the snippet
// and the tooltip without the tooltip disappearing first.
const HIDE_DELAY = 120

// One-line review snippet with the full text in a fixed-position tooltip. The
// tooltip is portalled to the body so the list's scroll container cannot clip
// it, and it is hidden on scroll/resize where its anchor would go stale.
function ReviewNote({ text }) {
    const anchorRef = useRef(null)
    const hideTimerRef = useRef(null)
    const tooltipId = useId()
    const [position, setPosition] = useState(null)

    const cancelHide = () => {
        if (hideTimerRef.current !== null) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
    }

    const show = () => {
        cancelHide()
        const anchor = anchorRef.current
        if (!anchor) {
            return
        }

        const rect = anchor.getBoundingClientRect()
        // The tooltip is capped at 160px tall; reserve a little more than that
        // before deciding it fits above the row.
        const placeBelow = rect.top < 180

        setPosition(
            placeBelow
                ? { top: rect.bottom + 8 }
                : { bottom: window.innerHeight - rect.top + 8 }
        )
    }

    const hide = () => {
        cancelHide()
        setPosition(null)
    }

    const scheduleHide = () => {
        cancelHide()
        hideTimerRef.current = setTimeout(() => {
            hideTimerRef.current = null
            setPosition(null)
        }, HIDE_DELAY)
    }

    useEffect(() => {
        if (!position) {
            return undefined
        }

        window.addEventListener('scroll', hide, true)
        window.addEventListener('resize', hide)
        return () => {
            window.removeEventListener('scroll', hide, true)
            window.removeEventListener('resize', hide)
        }
    }, [position])

    useEffect(() => cancelHide, [])

    return (
        <>
            <span
                ref={anchorRef}
                className="movie-review-note"
                tabIndex={0}
                aria-describedby={position ? tooltipId : undefined}
                onMouseEnter={show}
                onMouseLeave={scheduleHide}
                onFocus={show}
                onBlur={hide}
            >
                {text}
            </span>
            {position
                ? createPortal(
                    <div
                        id={tooltipId}
                        role="tooltip"
                        className="movie-review-tooltip"
                        style={position}
                        onMouseEnter={cancelHide}
                        onMouseLeave={scheduleHide}
                    >
                        {text}
                    </div>,
                    document.body
                )
                : null}
        </>
    )
}

export default ReviewNote
