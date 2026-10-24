import React, { useState } from 'react';
import '../resources/css/Collapsible.css';

const Collapsible = ({ title, children, open, itemCount, variant }) => {
  const [isOpen, setIsOpen] = useState(open);

  const toggleOpen = () => setIsOpen(prevState => !prevState);

  return (
    <div className={`collapsible${variant ? ` collapsible--${variant}` : ''}`}>
      <div className={`collapsible-header${isOpen ? '' : ' collapsible-header--closed'}`} onClick={toggleOpen}>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>{isOpen ? '-' : '+'}</span>
        <span className="title">{title}</span>
        {itemCount ? <span className='title-count'>{itemCount}</span> : null}
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;