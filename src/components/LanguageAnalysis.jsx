const LanguageAnalysis = ({ enrichedSongs }) => {
  const display = enrichedSongs ? '' : 'hidden';

  return (
    <div className={`mt-8 ${display}`}>
      <h2 className="text-2xl font-bold mb-4 sm:text-4xl text-center">Languages of your Songs</h2>
      
      <div className="max-w-5xl mx-auto overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="w-16 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
              <th className="w-2/5 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
              <th className="w-1/4 max-w-80 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Artist</th>
              <th className="w-24 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Language</th>
              <th className="w-24 px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Genius Match Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrichedSongs.map((song, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="w-12 px-2 py-4 whitespace-nowrap text-sm text-gray-350">{index + 1}</td>
                <td className="w-2/5 max-w-60 px-2 py-4 text-sm text-gray-900 truncate">{song.title}</td>
                <td className="w-1/4 max-w-60 px-2 py-4 text-sm text-gray-900 truncate">{song.artist}</td>
                <td className="w-24 max-w-60 px-2 py-4 whitespace-nowrap text-sm text-gray-900 truncate">{song.language}</td>
                <td className="w-24 px-2 py-4 whitespace-nowrap text-sm text-gray-350">
                  {song.geniusCoherence?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LanguageAnalysis;