import React, { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
}

const Alert: React.FC<AlertProps> = ({ children }) => (
  <div
    className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
    role="alert"
  >
    {children}
  </div>
);

export default Alert;