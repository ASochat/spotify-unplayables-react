import { Table } from 'react-bootstrap'

const LanguageAnalysis = ({ enrichedSongs }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Language Analysis of Your Songs</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-black">
            <tr>
              <th className="w-16 px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
              <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
              <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Artist</th>
              <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Language</th>
              <th className="px-2.5 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Genius Match Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {enrichedSongs.map((song, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="w-16 px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{song.title}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{song.artist}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{song.language}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">
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