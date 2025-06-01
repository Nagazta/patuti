import React from "react";

const HealthBar = ({ health }) => {
  return (
    <div className="health-bar">
      <div className="health-fill" style={{ width: `${health}%` }} />
    </div>
  );
};

export default HealthBar;

