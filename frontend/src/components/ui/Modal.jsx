import React, { useEffect } from 'react';

// Reusable Modal component
// Props:
// - isOpen: Boolean to control visibility
// - onClose: Function to call when closing (e.g., clicking backdrop or close button)
// - title: String for the modal title
// - children: Content to render inside the modal body
// - size: 'sm', 'md', 'lg' (defaults to md)

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Handle Escape key press to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    // Cleanup listener on unmount or when modal closes
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine size class
  let sizeClass = 'max-w-md'; // Default md
  if (size === 'sm') sizeClass = 'max-w-sm';
  if (size === 'lg') sizeClass = 'max-w-lg';
  if (size === 'xl') sizeClass = 'max-w-xl'; // Added xl

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on backdrop click
    >
      {/* Modal Panel */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} transform transition-all duration-300 ease-in-out scale-100 opacity-100 overflow-hidden`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
        {/* Optional Footer (can be added via children if needed) */}
        {/* <div className="p-4 border-t border-gray-200 flex justify-end"> ... </div> */}
      </div>
    </div>
  );
}

export default Modal;
