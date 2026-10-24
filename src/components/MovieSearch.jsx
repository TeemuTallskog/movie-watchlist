import React, { useState, useRef, useEffect, useMemo } from "react";
import MovieList from "./MovieList";
import { readStoredMovies } from "../utils/movieStorage";
import "../resources/css/MovieSearch.css"
import Logo from "../resources/icons/logo.svg"

const MovieSearch = ({setMovies, localById, deleteMovie, markAsWatched, editReview, open, onOpenChange}) => {
    const [search, setSearch ] = useState('')
    const [options, setOptions] = useState([]);
    const textAreaRef = useRef(null)
    // Dropdown visibility lives in App (openSection === 'search') so opening
    // the search collapses the watchlist/watched sections, and vice versa.
    const setisOpen = (value) => onOpenChange(Boolean(value))
    const [timeoutId, setTimeoutId] = useState(null)

    const apiQuery = async (search) => {
        if (search.length === 0) {
            setOptions([]);
            return;
        }
        const searchUrl = `https://v3.sg.media-imdb.com/suggestion/titles/x/${encodeURIComponent(search)}.json`
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': navigator.userAgent
            }
        })
        const data = await response.json()
        if (data && data.d){
            setOptions(data.d);
        }
    }

    const onChange = (e) => {
        setisOpen(true)
        const newValue = e.target.value;
        setSearch(newValue);
        if (newValue.length === 0) {
            setOptions([]);
        }
        if (timeoutId){
            clearTimeout(timeoutId);
        }
        const newTimeoutId = setTimeout(() => {
            apiQuery(newValue)
        }, 200);

        setTimeoutId(newTimeoutId);
    }

    useEffect(() => {
        const handleClick = (ev) => {
            if (!textAreaRef.current || !textAreaRef.current.contains(ev.target)) {
                setisOpen(false)
                return
            }
            // Only clicks on the search bar itself toggle the dropdown.
            // Clicks inside the results — selecting a row or opening and
            // using a card's menu — must keep the dropdown open.
            if (ev.target.closest('.input-container')) {
                setisOpen(!open)
            }
        }
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [open, onOpenChange]);

    const saveMovie = (item) => {
            // A movie already in either list must not be added again; its
            // search row is tinted and carries that list's menu instead.
            const alreadyStored = ['Movies', 'Watched Movies'].some(storage =>
                readStoredMovies(storage).some(movie => movie.id === item?.id)
            )
            if (alreadyStored) {
                return
            }
            let savedMovies = readStoredMovies('Movies');
            savedMovies.unshift(item);
            localStorage.setItem('Movies', JSON.stringify(savedMovies));
            setMovies(savedMovies)
            setSearch('')
            setOptions([])
    }

    // Which local list each dropdown result belongs to, for hue and menus.
    const variantById = useMemo(() => {
        const byId = new Map()
        localById?.forEach((entry, id) => byId.set(id, entry.list))
        return byId
    }, [localById])

    // Search rows backed by a local list render the stored entry, so its
    // review, personal rating and refreshed poster show instead of the raw
    // suggestion-API data.
    const enrichedOptions = useMemo(() => options.map(option => {
        const stored = localById?.get(option?.id)?.movie
        return stored ? { ...stored } : option
    }), [options, localById])

    return (
        <div ref={textAreaRef} className="search-container">
            <div className={`input-container ${open ? 'focused' : ''}`}>
            <a href="https://addons.mozilla.org/en-US/firefox/addon/movie-watchlist/" target="_blank" rel="noopener noreferrer" id="logo-link">
                <img src={Logo} alt="logo" id="logo"></img>
            </a>
            <input 
                className="search-field"
                type="text"
                name="input"
                value={search}
                onChange={onChange}
                autoComplete="off"
                placeholder="Search movies to add..."
            />
            </div>
            <div className={open ? "" : 'hide-dropdown'}>
                <MovieList
                    movies={enrichedOptions}
                    containerClass="search-result-container"
                    itemOnClick={saveMovie}
                    deleteMovie={deleteMovie}
                    markAsWatched={markAsWatched}
                    editReview={editReview}
                    listById={variantById}
                />
            </div>
        </div>
    )
};

export default MovieSearch;