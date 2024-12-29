///////////// GENERAL ADVICE ///////////////
// - Use React Developer Tools Chrome Extension to access components and props right from the console.
// - 2 ways of setting the profile: async await the connect function and call the const "profile" in another function "afterConnect", OR call setProfile after the .then.
////////////////////////////////////////////

console.log('START APP.JSX')

import { useEffect, useState } from 'react'

// Import created modules
import { redirectToAuthCodeFlow, getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'

// Import Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button } from 'react-bootstrap'
import './App.scss'
import Progress from './assets/Progress.jsx'

const Connecter = (props) => {

  return (
    <div className="mt-5">
      <Button variant="primary" size="lg" className="btn btn-outline-primary" onClick={props.onClick}>
        <span className="text-dark">Connect to Spotify to fetch your data</span>
      </Button>
    </div>
  )

}

const Profile = (props) => {

  const profile = {
    userId: props.profile.display_name,
    country: props.profile.country,
    email: props.profile.email,
    link: props.profile.external_urls.spotify //-- CAN'T READ external_urls properties because it's sometimes undefined
  };

  if (props.profile.images.length > 0) {
    profile.avatar = props.profile.images[Ø];
  } else {
    profile.avatar = 'No avatar available';
  }

  // console.log('in Profile component profile:', profile);

  return (
    <div className="container mt-5 pr-5">
      <h2>Logged in as </h2>
      <ul>
        <li>User ID: { profile.userId }</li>
        <li>country: { profile.country }</li>
        <li>Email: { profile.email }</li>
        <li>Link: <a id="url" href="#">{ profile.link }</a></li>
        <li>file Image: { profile.avatar }</li>
      </ul>
    </div>
  )
}

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

const UnplayableTracks = (props) => {

  // console.log('unplayables', props);

  return (
    <div className="container mt-5">
      <h2>Your unplayable tracks</h2>
      <p>Please note that we don't fetch your local files in your saved tracks.
        Therefore, the number on each track may not be the right one- it still gives an indication on its place in your list.
      </p>
      {/* Bootstrap built in Table component */}
      <Table striped>
          <thead>
              <tr>
                  <th>Number</th>
                  <th>Artist</th>
                  <th>Name</th>
                  <th>Added on</th>
              </tr>
          </thead>    
          <tbody>
          <tr>
              <td>0</td>
              <td>The Kops</td>
              <td>Halloween</td>
              <td>2010-01-01</td>
          </tr>
          { props.unplayables.map(track => 
          <tr key={track.number}>
              <td >{track.number}</td>
              <td>{track.artist}</td>
              <td>{track.title}</td>
              <td>{track.added_at}</td>
          </tr>
          ) }
          </tbody>
      </Table>
    </div>
  )

}

const App = (props) => {
  // console.log('App props: ', props)

  const appClientId = 'e61711cbd130408abf2d471288b77e87';
  const redirectUrl = 'http://localhost:5173/'
  // .env variables should defined as this but it doesn't work for now.
  // const appClientId = env.spotifyAppClientId;
  // const redirectUrl = env.redirectUrl; // IMPORTANT: IT HAS TO BE A REDIRECT URI ON THE APP SETTINGS ONLINE
  
  // Actually we could get rid of the access token code here if we store the data and don't fetch it twice...
  const accessToken = localStorage.getItem("access_token");
  // console.log("Access token is stored at: " + accessToken);

  // Retrieve the user code from the URL just after the Spotify opt-in.
  const params = new URLSearchParams(window.location.search)
  const URLparamCode = params.get('code');
  const storedUsedCode = localStorage.getItem('spotify_user_code')
  // WARNING: THE USER CODE REMAINS IN THE URL. SHOULD PROBABLY REDIRECT TO PAGE WITHOUT IT, BUT... WHEN I'LL HAVE A DATABASE
  const isCodeUsed = URLparamCode === storedUsedCode;

  // I had to define all userData properties since they are used in App.jsx. 
  // There's probably a better way, either through class, or JSON loading
  // Since it's the data per user, it should be stored in a JSON server, encapsulated for each user, and not local storaged
  let initUserData = localStorage.getItem('user_data')?
    JSON.parse(localStorage.getItem('user_data'))
    : { 
      fetched: false,
      profile: {displayName: '', email: '', country:'', external_urls: {spotify: ''}, images: []}, 
      topTracks: [], 
      allSongs: [], 
      unplayables: [],
    }

  const connectToSpotify = () => {
    redirectToAuthCodeFlow(appClientId, redirectUrl)
  }

  // DECIDED TO LOAD THE USERDATA DIRECTLY FROM MAIN
  const [userData, setUserData] = useState(initUserData)
  // Maybe I'll have to use useEffect if the userData is not defined yet...
  // useEffect(() => {
  //   setUserData(userData)
  // }, [])

  const [loading, setLoading] = useState(false)

  // useEffect to run the code only once
  useEffect(() => {
    // Théoriquement, on aurait même pas besoin de faire un localStorage, il faut juste passer la variable à l'app
    // Ici on utilise userData.fetched mais il faudrait plutôt un évènement de refresher
    if (!userData.fetched && URLparamCode && !isCodeUsed) {
      // REMOVED CONDITION (!accessToken || accessToken === 'undefined') since we use the accessToken only once - for now
      setLoading(true)
      console.log('Getting access token...')
      getAccessToken(appClientId, URLparamCode, redirectUrl).then(accessToken => {
        const profile = fetchProfile(accessToken)
        const topTracks = fetchTopTracks(accessToken)
        const allSongs = fetchAllSongs(accessToken)
        const unplayables = allSongs
          .then(songs => { 
            const filteredUnplayables = filterUnplayables(songs);
            return filteredUnplayables;
              // console.log('Post then unplayables:', filterUnplayables(songs))
            })
          .catch(error => console.error('Failed to fetch all tracks', error))
        
        Promise.all([profile, topTracks, allSongs, unplayables]).then(([profile, topTracks, allSongs, unplayables]) => {
          setLoading(false)
          console.log('Starting promise to pass all user data')
          setUserData({ fetched: true, profile, topTracks, allSongs, unplayables })
          localStorage.setItem('user_data', JSON.stringify({ fetched: true, profile, topTracks, allSongs, unplayables }));
        })
      })
      // Can't reuse the same user code, storing it local storage to avoid confusion
      localStorage.setItem('spotify_user_code', URLparamCode);
    } 
  })

  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (percentage < 95) {
      setTimeout(
        () => setPercentage(percentage + 5),
        500
      )
    }
  })

  return (
    <>

      <h1>Display your Spotify profile data</h1>

      <Connecter onClick={connectToSpotify}/> {/* Find a a way to hide if existing userData or change to REFRESH DATA */}
      {/* <Profile profile={userData.profile}/> */}
      {/* <TopTracks topTracks={userData.topTracks}/> */}
      <Progress colour={'#1ed760'} percentage={percentage} loading={loading}/> {/* Ideally I should use a colour variable primary instead of hard coding */}
      <UnplayableTracks unplayables={userData.unplayables}/>

      <br/>
    </>
  )
}

export default App
