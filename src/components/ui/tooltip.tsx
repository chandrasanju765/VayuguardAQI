import React, { useState } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`relative inline-block ${className ?? ""}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {children}
      {visible && (
        <span
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-black rounded shadow-lg z-10 whitespace-nowrap"
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
