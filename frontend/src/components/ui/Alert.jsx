import React from 'react';

// Alert component for feedback messages
// Props:
// - children: The message content
// - type: 'success', 'error', 'warning', 'info' (defaults to 'info')
// - className: Additional classes to merge
// - onClose: Optional function to call when closed (if closable)

function Alert({ children, type = 'info', className = '', onClose }) {
  let baseStyles = 'p-4 rounded-md border';
  let typeStyles = '';
  let IconComponent = null;

  switch (type) {
    case 'success':
      typeStyles = 'bg-green-50 border-green-300 text-green-800';
      IconComponent = () => ( // Basic Check Icon
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      );
      break;
    case 'error':
      typeStyles = 'bg-red-50 border-red-300 text-red-800';
      IconComponent = () => ( // Basic Error Icon (X)
         <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      );
      break;
    case 'warning':
      typeStyles = 'bg-yellow-50 border-yellow-300 text-yellow-800';
       IconComponent = () => ( // Basic Warning Icon (!)
         <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
       );
      break;
    case 'info':
    default:
      typeStyles = 'bg-blue-50 border-blue-300 text-blue-800';
       IconComponent = () => ( // Basic Info Icon (i)
         <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
       );
      break;
  }

  const mergedClassName = `${baseStyles} ${typeStyles} ${className} flex items-start`; // Use flex for icon alignment

  return (
    <div role="alert" className={mergedClassName}>
      {IconComponent && <IconComponent />}
      <div className="flex-grow">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="-mt-1 -mr-1 ml-2 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current" // Adjust focus ring offset based on bg color
          aria-label="Dismiss"
        >
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      )}
    </div>
  );
}

export default Alert;
