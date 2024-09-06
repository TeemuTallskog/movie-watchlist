import React, { useState, useRef, useEffect } from "react";
import MovieList from "./MovieList";
import "../resources/css/MovieSearch.css"
import Logo from "../resources/icons/logo.svg"

const MovieSearch = ({setMovies}) => {
    const [search, setSearch ] = useState('')
    const [options, setOptions] = useState([]);
    const textAreaRef = useRef(null)
    const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(true)
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

    useEffect(() => window.addEventListener('click', ev => {
        if(textAreaRef.current && textAreaRef.current.contains(ev.target)) {setIsOpen(!isOpen)}
        else {setIsOpen(false)}
    }));

    const saveMovie = (item) => {
            let savedMovies = JSON.parse(localStorage.getItem('Movies')) || [];
            savedMovies.unshift(item);
            localStorage.setItem('Movies', JSON.stringify(savedMovies));
            setMovies(savedMovies)
            setSearch('')
            setOptions([])
    }

    return (
        <div ref={textAreaRef} className="InputContainer">
            <img src={Logo} alt="logo" id="logo"></img>
            <input 
                className="search-field"
                type="text"
                name="input"
                value={search}
                onChange={onChange}
                autoComplete="off"
                placeholder="Search movies to add..."
            />
            <div className={isOpen ? "" : 'hide-dropdown'}><MovieList movies={options} containerClass="search-result-container" itemOnClick={saveMovie}/></div>
        </div>
    )
};

export default MovieSearch;