import React from 'react';
import PropTypes from 'prop-types';

const StoryRing = ({ 
  children, 
  size = 16, 
  hasUnseen = false, 
  onClick = () => {},
  className = ''
}) => {
  const sizeInRem = `${size / 4}rem`;
  const ringSize = `${(size + 4) / 4}rem`;
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      onClick={onClick}
      style={{
        width: ringSize,
        height: ringSize,
        minWidth: ringSize,
        minHeight: ringSize,
      }}
    >
      <div 
        className={`absolute inset-0 rounded-full ${
          hasUnseen 
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 p-0.5' 
            : 'bg-gray-200 p-px'
        }`}
      >
        <div className="bg-white rounded-full w-full h-full p-0.5">
          <div 
            className="rounded-full overflow-hidden"
            style={{
              width: sizeInRem,
              height: sizeInRem,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

StoryRing.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
  hasUnseen: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StoryRing;
