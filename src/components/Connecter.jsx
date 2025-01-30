const Connecter = ({ loading, userData, onClick }) => {
    const display = loading ? 'hidden' : '';
    const variant = userData.fetched 
      ? 'bg-white text-spotify-green border-2 border-spotify-green hover:bg-spotify-green-dark hover:text-white hover:border-spotify-green-dark' 
      : 'bg-spotify-green text-white border-2 border-spotify-green hover:bg-spotify-green-dark hover:border-spotify-green-dark';
  
    const text = userData.fetched ? 'Refresh your data' : 'Connect to Spotify to fetch your songs';
  
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center ${display}`}>
        <button 
          onClick={onClick}
          className={`${variant} w-full sm:w-auto px-6 sm:px-12 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer`}
        >
          <span>{text}</span>
        </button>
      </div>
    );
  };

export default Connecter;