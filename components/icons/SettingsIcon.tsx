import React from 'react';

const SettingsIcon: React.FC<{ className?: string }>=({ className })=> (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-5 w-5'}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M11.983 1.705a2 2 0 00-3.966 0l-.159 1.146a1 1 0 01-.73.83l-1.1.294a2 2 0 00-1.122 3.096l.649.95a1 1 0 010 1.137l-.649.95a2 2 0 001.122 3.096l1.1.294a1 1 0 01.73.83l.159 1.146a2 2 0 003.966 0l.159-1.146a1 1 0 01.73-.83l1.1-.294a2 2 0 001.122-3.096l-.649-.95a1 1 0 010-1.137l.649-.95a2 2 0 00-1.122-3.096l-1.1-.294a1 1 0 01-.73-.83l-.159-1.146zM10 7a3 3 0 110 6 3 3 0 010-6z" />
  </svg>
);

export default SettingsIcon;
