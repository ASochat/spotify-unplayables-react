const Connecter = ({ loading, userData, onClick }) => {
    const display = loading.global ? 'hidden' : '';
    const variant = userData.fetched.global
      ? 'bg-white text-spotify-green border-2 border-spotify-green hover:bg-spotify-green-light hover:text-black hover:border-spotify-green-light' 
      : 'bg-spotify-green text-black border-2 border-spotify-green hover:bg-spotify-green-light hover:border-spotify-green-light';
  
    const text = userData.fetched.global ? 'Refresh your data' : 'Connect to Spotify to fetch your songs';
  
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