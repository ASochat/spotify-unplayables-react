///////////// GENERAL ADVICE ///////////////
// - Use React Developer Tools Chrome Extension to access components and props right from the console.
// - 2 ways of setting the profile: async await the connect function and call the const "profile" in another function "afterConnect", OR call setProfile after the .then.
////////////////////////////////////////////

console.log('START APP.JSX')

// Global imports
import { useEffect, useState, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
// import axios from 'axios'

// Import created modules
import { redirectToAuthCodeFlow, getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'
import { enrichSongsWithLyricsAndLanguage } from './modules/lyrics_and_language.js'

// Import Bootstrap components
// import 'bootstrap/dist/css/bootstrap.min.css'; // Hmmm... This is only for CSS, NOT Sass. Necessary?
// import './App.scss' - Bootstrap.css is abandoned
import { Table, Form, Button } from 'react-bootstrap'

// Import created components
import Progress from './components/Progress.jsx'
import LanguageAnalysis from './components/LanguageAnalysis.jsx'

const Navigation = () => {
  return (
    <nav className="w-full border-b border-gray-200 bg-body-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-center flex-1">
            <div className="flex space-x-8">
              <Link 
                to="/" 
                className="text-body-color hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Your unplayables
              </Link>
              <Link 
                to="/insights" 
                className="text-body-color hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Insights on your songs
              </Link>
            </div>
          </div>
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
  const userName = props.userData.profile.display_name;
  const unplayablesNumber = props.userData.unplayables.length;
  const display = props.userData.fetched ? '' : 'hidden';

  return (
    <div className={`mt-8 ${display}`}>
      <h2 className="text-2xl font-bold mb-4">You have {unplayablesNumber} unplayable tracks, {userName}</h2>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {props.unplayables.map((track, index) => (
              <tr key={track.number} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="w-16 px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">{track.number}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{track.title}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-900">{track.artist}</td>
                <td className="px-2.5 py-3 whitespace-nowrap text-sm text-gray-500">{track.added_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const isFetchingRef = useRef(false);

  const updateLoadingState = (message, progressValue) => {
    setLoadingMessage(message);
    setProgress(progressValue);
    console.log(`${message} (${progressValue}%)`);
  };

  // Genius API access token
  const geniusAccessToken = import.meta.env.VITE_GENIUS_ACCESS_TOKEN

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchSpotifyData = async () => {
      // Prevent double fetching
      if (isFetchingRef.current) {
        return;
      }

      try {
        if (!userData.fetched && URLparamCode && !isCodeUsed) {
          isFetchingRef.current = true;
          updateLoadingState("Starting fetching...", 0);
          setLoading(true);
          
          try {
            updateLoadingState("Getting access token...", 10);
            await delay(10);
            const accessToken = await getAccessToken(appClientId, URLparamCode, redirectUrl);
            
            if (!accessToken) {
              throw new Error('Failed to get access token');
            }

            updateLoadingState('Fetching your Spotify profile...', 20);
            await delay(10);
            const profile = await fetchProfile(accessToken);

            updateLoadingState('Getting your top tracks...', 35);
            await delay(10);
            const topTracks = await fetchTopTracks(accessToken);
            // Update state immediately with top tracks
            setUserData(prev => ({ ...prev, topTracks }));

            updateLoadingState('Fetching all your saved songs...', 50);
            await delay(10);
            const allSongs = await fetchAllSongs(accessToken);
            setUserData(prev => ({ ...prev, 
              allSongs,
              fetched: true  // Mark as fetched when allSongs are fetched
            }));

            updateLoadingState('Finding unplayable tracks...', 65);
            await delay(10);
            const unplayables = allSongs ? await filterUnplayables(allSongs) : [];
            // Update state immediately with unplayables
            setUserData(prev => ({ 
                ...prev, 
                unplayables,
            }));

            // Start language analysis in background
            updateLoadingState('Getting lyrics and analyzing languages...', 70);
            const enrichedSongs = [];
            const chunkSize = 50;
            const totalChunks = Math.ceil((allSongs?.length || 0) / chunkSize);
            
            for (let i = 0; i < (allSongs?.length || 0); i += chunkSize) {
                const chunk = allSongs.slice(i, i + chunkSize);
                const currentChunk = Math.floor(i / chunkSize) + 1;
                const progressValue = 70 + Math.floor((currentChunk / totalChunks) * 25); // Progress from 70% to 95%
                
                updateLoadingState(
                    `Getting lyrics for songs ${i + 1}-${Math.min(i + chunkSize, allSongs.length)} of ${allSongs.length}...`, 
                    progressValue
                );
                
                await delay(10);
                const enrichedChunk = await enrichSongsWithLyricsAndLanguage(chunk, geniusAccessToken, chunkSize);
                enrichedSongs.push(...enrichedChunk);
                
                // Update enrichedSongs progressively
                setUserData(prev => ({ 
                    ...prev, 
                    enrichedSongs: [...enrichedSongs]
                }));
            }

            updateLoadingState('Saving your data...', 95);
            await delay(10);

            // Update state with all the data
            const newUserData = { 
              fetched: true, 
              profile, 
              topTracks, 
              allSongs, 
              unplayables, 
              enrichedSongs 
            };
            setUserData(newUserData);
            localStorage.setItem('user_data', JSON.stringify(newUserData));
            localStorage.setItem('spotify_user_code', URLparamCode);
            
            updateLoadingState('Complete!', 100);
            await delay(500); // Show completion briefly
            
          } catch (error) {
            console.error('Error fetching Spotify data:', error);
          } finally {
            setLoading(false);
            setLoadingMessage('');
            setProgress(0);
            isFetchingRef.current = false;
          }
        }
      } catch (error) {
        console.error('Error in fetchSpotifyData:', error);
        setLoading(false);
        setLoadingMessage('');
        setProgress(0);
        isFetchingRef.current = false;
      }
    };

    fetchSpotifyData();
  }, [URLparamCode, userData.fetched, isCodeUsed]);

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

  // let's see...
  
  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Find your <i>greyed out</i> saved songs that are no longer on Spotify</h1>
                </div>
                <div>
                  <p className="text-lg"><b>Why this website?</b> If you're like me, you probably have more than 2000 saved tracks on Spotify. 
                    And you may have realized that songs keep disappearing from your list.
                    This happens for various reasons: the artist quit the platform or published a remastered album, for example. 
                    But searching for those greyed out songs manually to replace them takes too much time. 
                    So <b>I created this tool to connect to Spotify API and fetch them all at once</b>. 
                    I hope it will be as helpful for you as it is for me! Cheers, Soch.</p>
                </div>
                <div>
                  {loading && (
                    <div className="mt-4 mb-4">
                      <Progress 
                        colour={'#1ed760'} 
                        percentage={progress} 
                        loading={loading}
                        message={loadingMessage}
                      />
                    </div>
                  )}
                  {!loading && userData.unplayables && (
                    <UnplayableTracks 
                      unplayables={userData.unplayables} 
                      userData={userData}
                    />
                  )}
                </div>
              </div>
            </main>
          } />
          <Route path="/insights" element={
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div>
                {loading && (
                  <div className="mt-4 mb-4">
                    <Progress 
                      colour={'#1ed760'} 
                      percentage={progress} 
                      loading={loading}
                      message={loadingMessage}
                    />
                  </div>
                )}
                <LanguageAnalysis enrichedSongs={userData.enrichedSongs || []} />
              </div>
            </main>
          } />
        </Routes>
        <Footer userData={userData} loading={loading} onConnect={connectToSpotify} />
      </Router>
    </>
  )
}

export default App
