import React, { useState } from 'react';
import '../resources/css/Collapsible.css';

const Collapsible = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen(prevState => !prevState);

  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={toggleOpen}>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>{'>'}</span>
        <span className="title">{title}</span>
      </div>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;