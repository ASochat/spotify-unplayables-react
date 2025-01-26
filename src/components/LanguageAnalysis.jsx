import { Table } from 'react-bootstrap'

const LanguageAnalysis = ({ enrichedSongs }) => {
  return (
    <div className="container mt-5">
      <h2>Language Analysis of Your Songs</h2>
      <Table striped>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Language</th>
            <th>Genius Match Score</th>
          </tr>
        </thead>
        <tbody>
          {enrichedSongs.map((song, index) => (
            <tr key={index}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>{song.language}</td>
              <td>{song.geniusCoherence?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default LanguageAnalysis