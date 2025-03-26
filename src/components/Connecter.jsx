const Connecter = ({ loading, userData, onClick, handleLogout }) => {

    const variant = userData.fetched.global || loading
      ? 'bg-white text-spotify-green border-2 border-spotify-green hover:bg-spotify-green-light hover:text-black hover:border-spotify-green-light' 
      : 'bg-spotify-green text-black border-2 border-spotify-green hover:bg-spotify-green-light hover:border-spotify-green-light';

    const variantLogout = userData.fetched.global
      ? 'bg-white text-gray-400 border-2 border-gray-400 hover:bg-gray-400 hover:text-white hover:border-gray-400'
      : 'hidden';

      
    const text = userData.fetched.global 
    ? 'Refresh your data' 
    : loading
        ? 'Stop the process'
        : 'Connect to Spotify to fetch your songs';
  
    return (
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-center gap-4`}>
        <button 
          onClick={handleLogout}
          className={`${variantLogout} w-full sm:w-auto px-6 sm:px-12 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer`}
        >
          <span>Log out</span>
        </button>
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