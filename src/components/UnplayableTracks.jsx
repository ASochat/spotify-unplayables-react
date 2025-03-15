const UnplayableTracks = (props) => {
    const userName = props.userData.profile.display_name;
    const unplayablesNumber = props.userData.unplayables.length;
    const display = props.userData.fetched.unplayables ? '' : 'hidden';
  
    return (
      <div className={`mt-8 ${display}`}>
        <h2 className="text-2xl font-bold mb-4 sm:text-4xl text-center">You have {unplayablesNumber} unplayable tracks, {userName}</h2>
        <div className="mb-6 text-gray-600 italic">
          <span>Please note that we don't fetch your local files in your saved tracks.
            Therefore, the number on each track may not be the right one- it still gives an indication on its place in your list.
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-black">
              <tr>
                <th className="w-16 px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Artist</th>
                <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Added on</th>
                <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">See on Spotify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {props.unplayables.map((track, index) => (
                <tr key={track.number} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="w-16 px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">{track.number}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{track.title}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{track.artist}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">{track.added_at}</td>
                  <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">
                    <a href={track.songUrl} target="_blank" rel="noopener noreferrer">
                      <button className="text-blue-500 hover:text-blue-700 cursor-pointer p-2">
                        <img 
                          src="/Spotify_Primary_Logo_Black_CMYK.svg" 
                          alt="Play on Spotify" 
                          className="h-6 w-auto hover:opacity-80 transition-opacity"
                        />
                      </button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

export default UnplayableTracks;