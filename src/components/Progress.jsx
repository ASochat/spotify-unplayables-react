const Progress = ({ stage, percentage, loading, message }) => {
//   if (!loading) return null;
    // console.log('loading', loading);
    // console.log('percentage', percentage);

    const percentageAlign = percentage > 0 ? 'text-center' : 'text-right';

  return (
    <div className="w-full py-3 flex items-center space-x-4 text-right">
      <div className="w-36 flex-shrink-0">
        <span className="text-sm font-medium text-gray-350">{stage}</span>
      </div>
      <div className="flex-grow">
        <div className="w-full bg-gray-200 rounded-full h-8 relative">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center bg-spotify-green"
            style={{
              width: `${percentage}%`,
            }}
          >
              <span className={`absolute w-full px-4 ${percentageAlign} text-sm font-medium`}>
                {percentage}%
              </span>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProgressSpecific = ({ progresses, loading, message }) => {
    if (!loading) return null;

    return (
        <div className="w-full space-y-4">
        {progresses.map((progress, index) => (
            <div key={index} className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-350">{progress.label}</span>
                <span className="text-sm font-medium text-gray-350">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 relative">
                <div 
                className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center bg-spotify-green"
                style={{
                    width: `${progress.percentage}%`,
                }}
                />
            </div>
            </div>
        ))}
        {message && (
            <div className="mt-2 text-center">
            <p className="text-gray-600">{message}</p>
            </div>
        )}
        </div>
    );
};

export { Progress, ProgressSpecific };

