const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9998,
        backgroundColor: 'transparent',
        pointerEvents: 'auto' // This ensures clicks are blocked
      }}
      onClick={onCancel} // Optional: close if you click outside box
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevents clicks from bubbling and closing modal
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: '#fff',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '300px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <h3 style={{ marginBottom: '10px', color: '#333' }}>{title}</h3>
        <p style={{ marginBottom: '20px', color: '#555' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
