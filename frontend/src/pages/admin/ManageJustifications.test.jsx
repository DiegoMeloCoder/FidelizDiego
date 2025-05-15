import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext.jsx'; // Assuming AuthProvider wraps your app
import ManageJustifications from './ManageJustifications.jsx';
import { getDocs, addDoc, updateDoc, doc, serverTimestamp, collection, query, where } from 'firebase/firestore';

// --- Mocks ---

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ /* Mock timestamp object if needed */ })),
}));

// Mock useAuth hook
jest.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: jest.fn(),
  // Also export AuthProvider if it's used in the test setup
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock child components (optional, but can simplify tests)
jest.mock('../../components/ui/Button', () => (props) => <button {...props} />);
jest.mock('../../components/ui/Input', () => (props) => <input {...props} />);
jest.mock('../../components/ui/Modal', () => ({ isOpen, onClose, title, children }) => isOpen ? (
  <div data-testid="modal">
    <h2>{title}</h2>
    {children}
    <button onClick={onClose}>Close Mock Modal</button>
  </div>
) : null);
jest.mock('../../components/ui/Spinner', () => () => <div data-testid="spinner">Loading...</div>);
jest.mock('../../components/ui/Alert', () => ({ children, type }) => <div role="alert" data-type={type}>{children}</div>);

// Mock window.confirm
global.confirm = jest.fn(() => true); // Default to true (user confirms)

// --- Test Suite --- jacob 

describe('ManageJustifications Component', () => {
  const mockUserData = {
    companyId: 'test-company-123',
    // Add other necessary user data if the component uses it
  };

  const mockGlobalJustification = {
    id: 'global1',
    textoJustificacion: 'Global Reason A',
    companyId: null,
    esPredeterminada: true,
    estaActiva: true,
  };

  const mockCompanyJustification1 = {
    id: 'comp1',
    textoJustificacion: 'Company Reason 1',
    companyId: 'test-company-123',
    esPredeterminada: false,
    estaActiva: true,
  };

   const mockCompanyJustification2 = {
    id: 'comp2',
    textoJustificacion: 'Company Reason 2 Inactive',
    companyId: 'test-company-123',
    esPredeterminada: false,
    estaActiva: false,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    useAuth.mockReturnValue({ userData: mockUserData }); // Provide mock user data

    // Default mock implementation for getDocs (can be overridden in specific tests)
    getDocs.mockResolvedValue({
      docs: [
        { id: mockGlobalJustification.id, data: () => mockGlobalJustification },
        { id: mockCompanyJustification1.id, data: () => mockCompanyJustification1 },
        { id: mockCompanyJustification2.id, data: () => mockCompanyJustification2 },
      ],
    });
     // Mock doc ref creation
     doc.mockImplementation((db, path, id) => ({ db, path, id }));
  });

  test('renders component title and add form', async () => {
    render(<ManageJustifications />);
    expect(screen.getByRole('heading', { name: /manage points justifications/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/justification text/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add justification/i })).toBeInTheDocument();
  });

  test('shows loading spinner initially', () => {
    // Override getDocs to simulate delay
    getDocs.mockImplementation(() => new Promise(() => {})); // Promise that never resolves
    render(<ManageJustifications />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('fetches and displays justifications correctly', async () => {
    render(<ManageJustifications />);

    // Wait for loading to finish and data to appear
    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText(mockGlobalJustification.textoJustificacion)).toBeInTheDocument();
    expect(screen.getByText(mockCompanyJustification1.textoJustificacion)).toBeInTheDocument();
    expect(screen.getByText(mockCompanyJustification2.textoJustificacion)).toBeInTheDocument();

    // Check types displayed
    const rows = screen.getAllByRole('row'); // Includes header row
    expect(rows[1]).toHaveTextContent(/Global\/Default/i); // First data row (after sort)
    expect(rows[2]).toHaveTextContent(/Company/i);
    expect(rows[3]).toHaveTextContent(/Company/i);

     // Check status badges
     expect(rows[1]).toHaveTextContent(/Active/i);
     expect(rows[2]).toHaveTextContent(/Active/i);
     expect(rows[3]).toHaveTextContent(/Inactive/i);
  });

   test('handles error during fetch', async () => {
    const errorMessage = 'Failed to load justifications.';
    getDocs.mockRejectedValue(new Error('Firestore error'));
    render(<ManageJustifications />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  test('adds a new company-specific justification', async () => {
    const newText = 'Excellent Performance Review';
    // Mock addDoc response
    addDoc.mockResolvedValue({ id: 'new-just-id' });

    render(<ManageJustifications />);

    // Wait for initial load
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    const input = screen.getByLabelText(/justification text/i);
    const addButton = screen.getByRole('button', { name: /add justification/i });

    fireEvent.change(input, { target: { value: newText } });
    fireEvent.click(addButton);

    // Check if addDoc was called correctly
    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(addDoc).toHaveBeenCalledWith(
        undefined, // collection mock returns undefined by default
        expect.objectContaining({
          textoJustificacion: newText,
          companyId: mockUserData.companyId,
          estaActiva: true,
          esPredeterminada: false,
        })
      );
    });

    // Check for success message (or optimistic UI update)
    // Note: Optimistic update check might be tricky if sorting changes order significantly
    expect(await screen.findByRole('alert', { 'data-type': 'success' })).toHaveTextContent(/Justification added successfully/i);
    // Check if the new item appears (might need refinement based on sorting)
    // expect(screen.getByText(newText)).toBeInTheDocument();
  });

   test('opens edit modal with correct data for company justification', async () => {
    render(<ManageJustifications />);
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Find the edit button for the first company justification
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    // Assuming the first company justification is the second data row after sorting
    fireEvent.click(editButtons[0]); // Click edit for mockCompanyJustification1

    await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /edit justification/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/justification text/i)).toHaveValue(mockCompanyJustification1.textoJustificacion);
    expect(screen.getByLabelText(/active/i)).toBeChecked();
  });

  test('saves edited company justification', async () => {
    render(<ManageJustifications />);
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Open modal first
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]); // Click edit for mockCompanyJustification1
    await waitFor(() => expect(screen.getByTestId('modal')).toBeInTheDocument());

    const updatedText = 'Updated Company Reason 1';
    const textInput = screen.getByLabelText(/justification text/i);
    const activeCheckbox = screen.getByLabelText(/active/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(textInput, { target: { value: updatedText } });
    fireEvent.click(activeCheckbox); // Deactivate it
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(), // Mocked doc ref
        { textoJustificacion: updatedText, estaActiva: false }
      );
    });

    // Check modal closed and success message
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    expect(await screen.findByRole('alert', { 'data-type': 'success' })).toHaveTextContent(/Justification updated successfully/i);
  });

   test('prevents editing global justifications', async () => {
     // Mock alert
     const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
     render(<ManageJustifications />);
     await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

     // Find the row for the global justification
     const globalRow = screen.getByText(mockGlobalJustification.textoJustificacion).closest('tr');
     // Try to find an edit button within that row (shouldn't exist or be disabled)
     const editButtonInGlobalRow = globalRow.querySelector('button[name*="Edit"]'); // More specific selector might be needed

     // If the button exists, try clicking it
     if (editButtonInGlobalRow) {
        fireEvent.click(editButtonInGlobalRow);
     } else {
        // Alternatively, check that the action cell shows "N/A (Global)"
        expect(globalRow).toHaveTextContent(/N\/A \(Global\)/i);
     }


     // Check that the modal did NOT open
     expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
     // Check if alert was called (if that's the prevention mechanism)
     // expect(alertMock).toHaveBeenCalledWith("Default or global justifications cannot be edited here.");

     alertMock.mockRestore(); // Clean up mock
   });

   test('deactivates a company justification', async () => {
    render(<ManageJustifications />);
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Find the deactivate button for the active company justification
    const deactivateButton = screen.getByRole('button', { name: /deactivate/i });
    fireEvent.click(deactivateButton);

    // Check confirmation was called
    expect(global.confirm).toHaveBeenCalledTimes(1);

    // Check updateDoc was called
    await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledTimes(1);
        expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { estaActiva: false });
    });

    // Check for success message
    expect(await screen.findByRole('alert', { 'data-type': 'success' })).toHaveTextContent(/Justification deactivated successfully/i);
   });

    test('activates an inactive company justification', async () => {
    render(<ManageJustifications />);
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());

    // Find the activate button for the inactive company justification
    const activateButton = screen.getByRole('button', { name: /activate/i });
    fireEvent.click(activateButton);

    // Check confirmation was called
    expect(global.confirm).toHaveBeenCalledTimes(1);

    // Check updateDoc was called
    await waitFor(() => {
        expect(updateDoc).toHaveBeenCalledTimes(1);
        expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { estaActiva: true });
    });

    // Check for success message
    expect(await screen.findByRole('alert', { 'data-type': 'success' })).toHaveTextContent(/Justification activated successfully/i);
   });

});
