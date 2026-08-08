// frontend/src/pages/Admin/AdminLayout.tsx

import React from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>{title}</h2>
      </div>
      <div className="admin-section-body">{children}</div>
    </div>
  );
};
