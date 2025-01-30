
const TopTracks = (props) => {
    return (
      <div className="container mt-5">
        <h2>Your {props.topTracks.length} top tracks</h2>
        <ul>
          { props.topTracks.map ( (track, index) => 
            <li key={index+1}>{index+1}: {track.title} - {track.artist}</li> // Need to have a unique key tag for <li> that's the law
          ) }
        </ul>
      </div>
    )
  }

export default TopTracks;