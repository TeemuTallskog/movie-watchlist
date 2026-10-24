import React from 'react';
import '../resources/css/SortControl.css';
import { SORT_WITH_DIRECTION } from '../utils/sorting';

const SortControl = ({ options, sort, setSort, direction, setDirection }) => {
  const hasDirection = SORT_WITH_DIRECTION.has(sort)

  const changeSort = (event) => {
    setSort(event.target.value)
  }

  const toggleDirection = () => {
    setDirection(prevState => prevState === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className={`sort-control${hasDirection ? '' : ' sort-control--no-direction'}`}>
      <label className="sort-control-label" aria-hidden="true">Sort</label>
      <select
        className="sort-control-select"
        value={sort}
        onChange={changeSort}
        aria-label="Sort movies"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {hasDirection ? (
        <button
          type="button"
          className={`sort-control-direction${direction === 'asc' ? ' sort-control-direction--asc' : ''}`}
          onClick={toggleDirection}
          aria-label={direction === 'asc' ? 'Sorted ascending; switch to descending' : 'Sorted descending; switch to ascending'}
          title={direction === 'asc' ? 'Ascending (switch to descending)' : 'Descending (switch to ascending)'}
        >
          <svg
            className="sort-control-direction-icon"
            viewBox="0 0 12 10"
            aria-hidden="true"
            focusable="false"
          >
            {/* Three bars, narrow on top to wide at the bottom. */}
            <rect x="4.5" y="0.5" width="3" height="2" />
            <rect x="3" y="4" width="6" height="2" />
            <rect x="1" y="7.5" width="10" height="2" />
          </svg>
        </button>
      ) : null}
    </div>
  );
};

export default SortControl;
