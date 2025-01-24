///////////// GENERAL ADVICE ///////////////
// - Use React Developer Tools Chrome Extension to access components and props right from the console.
// - 2 ways of setting the profile: async await the connect function and call the const "profile" in another function "afterConnect", OR call setProfile after the .then.
////////////////////////////////////////////

console.log('START APP.JSX')

// Global imports
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
// import axios from 'axios'

// Import created modules
import { redirectToAuthCodeFlow, getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'
import { enrichSongsWithLyricsAndLanguage } from './modules/lyrics_and_language.js'

// Import Bootstrap components
// import 'bootstrap/dist/css/bootstrap.min.css'; // Hmmm... This is only for CSS, NOT Sass. Necessary?
import './App.scss'
import { Table, Form, Button } from 'react-bootstrap'

// Import created components
import Progress from './components/Progress.jsx'
import LanguageAnalysis from './components/LanguageAnalysis.jsx'

const Navigation = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        {/* <Link className="navbar-brand" to="/">Spotify Unplayables</Link> */}
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Your unplayables</Link>
          <Link className="nav-link" to="/insights">Insights on your songs</Link>
        </div>
      </div>
    </nav>
  )
}

const Connecter = (props) => {
  const display = props.loading ? 'd-none' : ''
  const variant = props.userData.fetched ? 'outline-primary' : 'primary'
  const text = props.userData.fetched ? 'Refresh your data' : 'Connect to Spotify to fetch your songs'

  return (
    <div className={"mt-5 " + display}>
      <Button variant={variant} size="lg" className="btn-custom" onClick={props.onClick}>
        <span>{text}</span>
      </Button>
    </div>
  )
}

const Footer = ({ userData, loading, onConnect }) => {
  return (
    <>
      <div className="row">
        <Connecter onClick={onConnect} loading={loading} userData={userData}/>
      </div>
      <div className="row mt-5 thanks">
        <p>Made with love by Antoine Sochat. Website: <a href="https://soch.at">soch.at</a>. Any suggestion: antoine@soch.at</p>
      </div>
      <br/>
    </>
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
  const userName = props.userData.profile.display_name;
  const unplayablesNumber = props.userData.unplayables.length;
  const display = props.userData.fetched ? '' : 'd-none';

  return (
    <div className={"container mt-5 " + display}>
      <h2>You have {unplayablesNumber} unplayable tracks, {userName}</h2>
      <div className="mt-4 mb-5 paragraph">
        <span><i>Please note that we don't fetch your local files in your saved tracks.
          Therefore, the number on each track may not be the right one- it still gives an indication on its place in your list.
        </i></span>
      </div>
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
          {/* <tr>
              <td>0</td>
              <td>The Kops</td>
              <td>Halloween</td>
              <td>2010-01-01</td>
          </tr> */}
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

  // Vite can't use process.env, but uses import.meta.env instead.
  // IMPORTANT: .env variables have to start with 'VITE'

  // impossible  de définir appClientId et redirectUrl comme des constantes dans le build et je n'ai aucune idée pourquoi
  let appClientId = '';
  let redirectUrl = '';
  const environment = import.meta.env.MODE;
  // console.log('import meta env:', import.meta.env);

  if (environment == 'development') {
    appClientId = import.meta.env.VITE_SPOTIFY_APP_CLIENT_ID_DEV
    redirectUrl = import.meta.env.VITE_REDIRECT_URL_DEV 
  } else {
    appClientId = import.meta.env.VITE_SPOTIFY_APP_CLIENT_ID_PROD
    redirectUrl = import.meta.env.VITE_REDIRECT_URL_PROD 
  }

  // console.log(appClientId, redirectUrl);


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
  const emptyUserData = { 
    fetched: false,
    profile: {displayName: '', email: '', country:'', external_urls: {spotify: ''}, images: []}, 
    topTracks: [], 
    allSongs: [], 
    unplayables: [],
  }

  let initUserData = localStorage.getItem('user_data')?
    JSON.parse(localStorage.getItem('user_data'))
    : emptyUserData;

  const connectToSpotify = () => {
    localStorage.removeItem('user_data');
    setUserData(emptyUserData);
    redirectToAuthCodeFlow(appClientId, redirectUrl)
  }

  // DECIDED TO LOAD THE USERDATA DIRECTLY FROM MAIN
  const [userData, setUserData] = useState(initUserData)
  // Maybe I'll have to use useEffect if the userData is not defined yet...
  // useEffect(() => {
  //   setUserData(userData)
  // }, [])

  const [loading, setLoading] = useState(false)

  // Genius API access token
  const geniusAccessToken = import.meta.env.VITE_GENIUS_ACCESS_TOKEN

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
          .catch(error => console.error('Failed to fetch all tracks and filter unplayables', error))
        const enrichedSongs = allSongs
          .then(async songs => { 
            const enrichedResults = await enrichSongsWithLyricsAndLanguage(songs, geniusAccessToken);
            console.log('Finished processing all songs');
            return enrichedResults;
          })
          .catch(error => {
            console.error('Failed to fetch all tracks and enrich them:', error);
            return []; // Return empty array on error to prevent undefined
          });
        
        Promise.all([profile, topTracks, allSongs, unplayables, enrichedSongs]).then(([profile, topTracks, allSongs, unplayables, enrichedSongs]) => {
          setLoading(false)
          console.log('Starting promise to pass all user data')
          setUserData({ fetched: true, profile, topTracks, allSongs, unplayables, enrichedSongs })
          localStorage.setItem('user_data', JSON.stringify({ fetched: true, profile, topTracks, allSongs, unplayables, enrichedSongs }));
        })
      })
      // Can't reuse the same user code, storing it local storage to avoid confusion
      localStorage.setItem('spotify_user_code', URLparamCode);
    } 
  })

  // const test = new Date("2020-05-12T23:50:21.817Z");
  // console.log(test, test.toLocaleDateString());

  // Progress percentage
  const [percentage, setPercentage] = useState(0)
  useEffect(() => {
    if (percentage < 95) {
      setTimeout(
        () => setPercentage(percentage + 5),
        500
      )
    }
  })

  // Number of times fetching
  const [fetchings, setFetchings] = useState(0)
  // useEffect(() => {
  //   console.log('effect')
  //   axios
  //     .get('http://localhost:3001/notes')
  //     .then(response => {
  //       console.log('promise fulfilled')
  //       setNotes(response.data)
  //     })
  // }, [])

  // const addNote = (event) => {
  //   event.preventDefault(); // Apparently not necessary if we have an onChange but that doesn't fait du mal
  //   console.log('button clicked', event.target.value)

  //   const noteObject = {
  //     content: newNote,
  //     important: Math.random() < 0.5, // 50% chance of being true
  //     id: String(notes.length + 1),
  //   }

  //   // setNotes(notes.concat(noteObject))
  //   // setNewNote('')

  //   // Posting the new note to the JSON server and setting the note here in the const too
  //   axios
  //     .post('http://localhost:3001/notes', noteObject)
  //     .then(response => {
  //       setNotes(notes.concat(response.data))
  //       setNewNote('')
  //     })

  return (
    <>
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={
          <div className="container">
            <div className="row">
              <h1>Find your <i>greyed out</i> saved songs that are no longer on Spotify</h1>
            </div>
            <div className="row mt-5">
              <p><b>Why this website?</b> If you're like me, you probably have more than 2000 saved tracks on Spotify. 
                And you may have realized that songs keep disappearing from your list.
                This happens for various reasons: the artist quit the platform or published a remastered album, for example. 
                But searching for those greyed out songs manually to replace them takes too much time. 
                So <b>I created this tool to connect to Spotify API and fetch them all at once</b>. 
                I hope it will be as helpful for you as it is for me! Cheers, Soch.</p>
            </div>
            {/* <Profile profile={userData.profile}/> */}
            {/* <TopTracks topTracks={userData.topTracks}/> */}
            <div className="row">
              <Progress colour={'#1ed760'} percentage={percentage} loading={loading}/> {/* Ideally I should use a colour variable primary instead of hard coding */}
              <UnplayableTracks unplayables={userData.unplayables} userData={userData}/>
            </div>
          </div>
        } />
        <Route path="/insights" element={
            <LanguageAnalysis enrichedSongs={userData.enrichedSongs || []} />
        } />
      </Routes>
      <Footer userData={userData} loading={loading} onConnect={connectToSpotify} />
    </Router>
    </>
  )
}

export default App
