import React from 'react';

const Loader = ({ size = 'medium', color = 'green' }) => {
  // Set sizes based on the size prop
  let sizeClass = 'h-8 w-8';
  if (size === 'small') {
    sizeClass = 'h-5 w-5';
  } else if (size === 'large') {
    sizeClass = 'h-12 w-12';
  }
  
  // Set color based on the color prop
  let borderColor = 'border-green-500';
  if (color === 'blue') {
    borderColor = 'border-blue-500';
  } else if (color === 'gray') {
    borderColor = 'border-gray-500';
  } else if (color === 'white') {
    borderColor = 'border-white';
  }
  
  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClass} border-4 ${borderColor} border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader; 