// frontend/src/components/admin/AdminModal.tsx

import React, { ReactNode } from "react";
import "./AdminModal.css";

export interface AdminModalField {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "color"
    | "date";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  rows?: number;
  fullWidth?: boolean;
  hint?: string;
}

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  fields: AdminModalField[];
  isSubmitting?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children?: ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  fields,
  isSubmitting = false,
  saveLabel = "Сохранить",
  cancelLabel = "Отмена",
  size = "md",
  className = "",
  children,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "admin-modal-sm",
    md: "admin-modal-md",
    lg: "admin-modal-lg",
    xl: "admin-modal-xl",
  };

  const renderField = (field: AdminModalField) => {
    const commonProps = {
      id: field.name,
      value: field.value ?? "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => field.onChange(e.target.value),
      disabled: field.disabled || isSubmitting,
      placeholder: field.placeholder,
      required: field.required,
      className: `admin-modal-input ${field.fullWidth ? "full-width" : ""}`,
    };

    switch (field.type) {
      case "select":
        return (
          <select {...commonProps}>
            <option value="">Выберите...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return <textarea {...commonProps} rows={field.rows || 3} />;

      case "color":
        return (
          <input
            {...commonProps}
            type="color"
            className={`admin-modal-input admin-modal-color ${field.fullWidth ? "full-width" : ""}`}
          />
        );

      case "number":
        return <input {...commonProps} type="number" step="any" />;

      case "email":
        return <input {...commonProps} type="email" />;

      case "password":
        return <input {...commonProps} type="password" />;

      case "date":
        return <input {...commonProps} type="date" />;

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal-content ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button
            className="admin-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-fields">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`admin-modal-field ${field.fullWidth ? "full-width" : ""}`}
              >
                <label htmlFor={field.name} className="admin-modal-label">
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
                {field.hint && (
                  <span className="admin-modal-hint">{field.hint}</span>
                )}
              </div>
            ))}
          </div>
          {children}
        </div>

        <div className="admin-modal-footer">
          <button
            onClick={onClose}
            className="admin-btn admin-btn-secondary"
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onSave}
            className="admin-btn admin-btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Сохранение..." : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
