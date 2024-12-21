///////////// GENERAL ADVICE ///////////////
// - Use React Developer Tools Chrome Extension to access components and props right from the console.
// - 2 ways of setting the profile: async await the connect function and call the const "profile" in another function "afterConnect", OR call setProfile after the .then.
////////////////////////////////////////////

console.log('START APP.JSX')

import { useEffect, useState } from 'react'
//import './App.css'

// Import created modules
import { redirectToAuthCodeFlow } from './modules/spotify_connect'

const Connecter = (props) => {

  return (
    <div>
      <button onClick={props.onClick}>Connect to Spotify to feth your data</button>
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
    <div>
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
    <div>
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

  return (
    <div>
      <h2>Your unplayable tracks</h2>
      <p>Please note that we don't fetch your local files in your saved tracks.
        Therefore, the number on each track may not be the right one- it still gives an indication on its place in your list.
      </p>
      <table>
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
      </table>
    </div>
  )

}

const App = (props) => {
  // console.log('App props: ', props)

  const appClientId = 'e61711cbd130408abf2d471288b77e87';
  const redirectUrl = 'http://localhost:5173/'
  // const appClientId = env.spotifyAppClientId;
  // const redirectUrl = env.redirectUrl; // IMPORTANT: IT HAS TO BE A REDIRECT URI ON THE APP SETTINGS ONLINE

  const connectToSpotify = () => {
    redirectToAuthCodeFlow(appClientId, redirectUrl)
  }

  // DECIDED TO LOAD THE USERDATA DIRECTLY FROM MAIN
  // console.log('stored user_data:', localStorage.getItem('user_data'));
  // const [userData, setUserData] = useState({props.userData})
  // setUserData(JSON.parse(localStorage.getItem('user_data')))
  // THIS DOESN'T WORK BECAUSE IT'S UNABLE TO GET THE SINGLE VARIABLES EVERYTIME...
  // useEffect(() => {
  //   if (localStorage.getItem('user_data')) {
  //     setUserData(JSON.parse(localStorage.getItem('user_data')))
  //   }
  // }, [])

  // let userData = { profile: null, topTracks:null, allSongs:null, unplayables:null }
  // if (localStorage.getItem('user_data')) {
  //   const userData = JSON.parse(localStorage.getItem('user_data'))
  // } else {
  //   const userData = { profile: null, topTracks:null, allSongs:null, unplayables:null }
  // }
  // const userData = JSON.parse(localStorage.getItem('user_data'));
  console.log('in App userData:', props.userData);

  return (
    <>

      <h1>Display your Spotify profile data</h1>

      <Connecter onClick={connectToSpotify}/> {/* Find a a way to hide if existing userData or change to REFRESH DATA */}
      <Profile profile={props.userData.profile}/>
      <TopTracks topTracks={props.userData.topTracks}/>
      <UnplayableTracks unplayables={props.userData.unplayables}/>

      <br/>
    </>
  )
}

export default App
