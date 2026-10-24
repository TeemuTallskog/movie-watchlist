import React from 'react';
import '../resources/css/Collapsible.css';

const Collapsible = ({ title, children, open, onToggle, itemCount, variant, headerExtra }) => {
  const isOpen = Boolean(open);

  return (
    <div className={`collapsible${variant ? ` collapsible--${variant}` : ''}`}>
      <div className={`collapsible-header${isOpen ? '' : ' collapsible-header--closed'}`} onClick={onToggle}>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>{isOpen ? '-' : '+'}</span>
        <span className="title">{title}</span>
        {itemCount ? <span className='title-count'>{itemCount}</span> : null}
        {headerExtra ? (
          // Clicks inside the control must not collapse the panel.
          <span className="collapsible-header-extra" onClick={event => event.stopPropagation()}>
            {headerExtra}
          </span>
        ) : null}
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;