import React from 'react';

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.163-.82-.426-1.125-.263-.304-.633-.477-1.04-.496-1.89-.086-3.32-1.93-2.56-3.833.38-1.02.93-1.97 1.62-2.82.7-.85 1.52-1.57 2.45-2.12.62-.36 1.32-.57 2.04-.63.28-.02.56.03.83.13.52.19 1.02.52 1.38.95.86 1.05 1.25 2.44 1.25 4.34 0 1.667 0 3.333 0 5"/>
  </svg>
);
