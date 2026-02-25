import React from 'react';

const ClosetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M10 21v-2a4 4 0 0 1 4-4v0a4 4 0 0 1 4 4v2"/>
    <path d="M6 21v-2a4 4 0 0 0-4-4v0"/>
    <path d="M14 6a4 4 0 0 0-8 0"/>
    <path d="M6 6h12"/>
  </svg>
);

export default ClosetIcon;