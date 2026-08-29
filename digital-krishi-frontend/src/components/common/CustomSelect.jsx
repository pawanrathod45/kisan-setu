import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import "./CustomSelect.css";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  icon: Icon,
  placeholder = "Select...",
  className = "",
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`ks-custom-select-wrap ${className}`} ref={selectRef} style={style}>
      <button
        type="button"
        className={`ks-custom-select-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="ks-custom-select-left">
          {Icon && <span className="ks-custom-select-icon"><Icon /></span>}
          <span className="ks-custom-select-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <FaChevronDown className={`ks-custom-select-chevron ${isOpen ? "rotate" : ""}`} />
      </button>

      {isOpen && (
        <div className="ks-custom-select-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                className={`ks-custom-select-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="ks-custom-select-item-text">{opt.label}</span>
                {isSelected && <FaCheck className="ks-custom-select-check" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
