import React, { useState } from 'react';
import '../resources/css/Collapsible.css';

const Collapsible = ({ title, children, open, itemCount }) => {
  const [isOpen, setIsOpen] = useState(open);

  const toggleOpen = () => setIsOpen(prevState => !prevState);

  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={toggleOpen}>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>{isOpen ? '-' : '+'}</span>
        <span className="title">{title}</span>
        {itemCount ? <span className='title-count'>{itemCount}</span> : null}
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;