const Progress = ({ colour, percentage, loading, message }) => {
  if (!loading) return null;

  return (
    <div className="progress-container">
      <div className="progress">
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{
            width: `${percentage}%`,
            backgroundColor: colour
          }}
        >
          {percentage}%
        </div>
      </div>
      {message && (
        <div className="text-center mt-2">
          <p className="text-muted">{message}</p>
        </div>
      )}
    </div>
  );
};

export default Progress
