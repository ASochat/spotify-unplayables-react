
const Playlists = (props) => {
    return (
      <div className="container mt-5">
        <h2>Your {props.playlists.length} playlists</h2>
        <ul>
          { props.playlists.map ( (playlist, index) => 
            <li key={index+1}>{index+1}: {playlist.name}</li> // Need to have a unique key tag for <li> that's the law
          ) }
        </ul>
      </div>
    )
  }

export default Playlists;