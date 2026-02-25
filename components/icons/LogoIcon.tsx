import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#A755F7" />
        <stop offset="100%" stopColor="#F252E3" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#logo-gradient)" />
    <path
      d="M16 34V26C16 22.6863 18.6863 20 22 20H29"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 14H32V22"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default LogoIcon;