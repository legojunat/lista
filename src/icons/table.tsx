import React from "react";

const TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <line x1="21" y1="6" x2="3" y2="6" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line
      x1="21"
      y1="10"
      x2="3"
      y2="10"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="21"
      y1="14"
      x2="3"
      y2="14"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="21"
      y1="18"
      x2="3"
      y2="18"
      stroke="#333333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TableIcon;
