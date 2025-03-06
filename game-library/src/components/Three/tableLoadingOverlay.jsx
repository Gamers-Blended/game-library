import React from "react";

const TableLoadingOverlay = () => {
  return (
    <div className="tableLoadingOverlayContainer">
      <div className="tableLoadingOverlay">
        <svg
          className="loadingSpinner"
          viewBox="0 0 50 50"
          width="40"
          height="40"
        >
          <circle
            className="loadingSpinnerCircle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          />
        </svg>
        <div className="loadingText">Loading data...</div>
      </div>
    </div>
  );
};

export default TableLoadingOverlay;
