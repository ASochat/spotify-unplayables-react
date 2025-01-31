if (import.meta.env.DEV) {
  console.log('START APP.JSX')
}

// Global imports
import { useEffect, useState, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'

// Import created modules
import { redirectToAuthCodeFlow, getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'
import { enrichSongsWithLyricsAndLanguage } from './modules/lyrics_and_language.js'

// Import created components
import { Progress, ProgressSpecific } from './components/Progress'
import LanguageAnalysis from './components/LanguageAnalysis.jsx'
import Navigation from './components/Navigation.jsx'
import Footer from './components/Footer.jsx'
import Connecter from './components/Connecter.jsx'
import Profile from './components/Profile.jsx'
import UnplayableTracks from './components/UnplayableTracks.jsx'
import TopTracks from './components/TopTracks.jsx'


const App = (props) => {
  // console.log('App props: ', props)

  // Vite can't use process.env, but uses import.meta.env instead.
  // IMPORTANT: .env variables have to start with 'VITE'

  // impossible  de définir appClientId et redirectUrl comme des constantes dans le build et je n'ai aucune idée pourquoi
  let appClientId = '';
  let redirectUrl = '';
  const environment = import.meta.env.MODE;

  if (environment == 'development') {
    appClientId = import.meta.env.VITE_SPOTIFY_APP_CLIENT_ID_DEV
    redirectUrl = import.meta.env.VITE_REDIRECT_URL_DEV 
  } else {
    appClientId = import.meta.env.VITE_SPOTIFY_APP_CLIENT_ID_PROD
    redirectUrl = import.meta.env.VITE_REDIRECT_URL_PROD 
  }

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
    fetched: {global: false, data: false, unplayables: false, enrichedSongs: false},
    profile: {displayName: '', email: '', country:'', external_urls: {spotify: ''}, images: []}, 
    topTracks: [], 
    allSongs: [], 
    unplayables: [],
  }

  let initUserData = localStorage.getItem('user_data')?
    JSON.parse(localStorage.getItem('user_data'))
    : emptyUserData;

  // Add this at component level
  const abortController = useRef(null);

  const connectToSpotify = () => {
    if (loading.global) {
      // Stop all ongoing requests
      window.stop();
      // Abort any ongoing fetch requests
      if (abortController.current) {
        console.log('Aborting requests...', abortController.current);
        abortController.current.abort();
      } else {
        console.log('No abort controller found');
      }
      // Reset loading state
      setLoading({
        global: false,
        dataFetching: false,
        unplayablesFiltering: false,
        songEnrichment: false
      });
      window.stop(); // This stops all ongoing requests
      return;
    }

    // Start new connection
    abortController.current = new AbortController();
    localStorage.removeItem('user_data');
    setUserData(emptyUserData);
    redirectToAuthCodeFlow(appClientId, redirectUrl);
  }

  // DECIDED TO LOAD THE USERDATA DIRECTLY FROM MAIN
  const [userData, setUserData] = useState(initUserData)
  // Maybe I'll have to use useEffect if the userData is not defined yet...
  // useEffect(() => {
  //   setUserData(userData)
  // }, [])

  // Initialize progress state with all stages
  const [progress, setProgress] = useState({
    global: 0,
    dataFetching: 0,
    unplayablesFiltering: 0,
    songEnrichment: 0
  });

  // Initialize loading state
  const [loading, setLoading] = useState({
    global: false,
    dataFetching: false,
    unplayablesFiltering: false,
    songEnrichment: false
  });

  const [loadingMessage, setLoadingMessage] = useState('');
  const isFetchingRef = useRef(false);

  // Update function
  const updateLoadingState = (message, globalProgressValue, stage, stageProgressValue) => {
    setLoadingMessage(message);
    if (stage) {
      setProgress(prev => ({
        ...prev,
        global: globalProgressValue,
        [stage]: stageProgressValue,
      }));
      console.log(`${message} (${globalProgressValue}%) - ${stage}: ${stageProgressValue}%`);
    } else {
      setProgress(prev => ({
        ...prev,
        global: globalProgressValue,
      }));
      console.log(`${message} (${globalProgressValue}%)`);
    }
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
        if (!userData.fetched.global && URLparamCode && !isCodeUsed) {
          // Store the user code in localStorage first thing
          localStorage.setItem('spotify_user_code', URLparamCode);

          isFetchingRef.current = true;
          updateLoadingState("Starting fetching...", 5, 'dataFetching', 5);
          setLoading(prev => ({
            ...prev,
            global: true,
          }));
          
          try {
            updateLoadingState("Getting access token...", 10, 'dataFetching', 10);
            await delay(10);
            const accessToken = await getAccessToken(appClientId, URLparamCode, redirectUrl);
            
            if (!accessToken) {
              throw new Error('Failed to get access token');
            }

            updateLoadingState('Fetching your Spotify profile...', 15, 'dataFetching', 15);
            await delay(10);
            const profile = await fetchProfile(accessToken);
            setUserData(prev => ({ 
              ...prev, 
              profile
            }));

            updateLoadingState('Getting your top tracks...', 20, 'dataFetching', 20);
            await delay(10);
            const topTracks = await fetchTopTracks(accessToken);
            // Update state immediately with top tracks
            setUserData(prev => ({ ...prev, topTracks }));

            updateLoadingState('Fetching all your saved songs...', 25, 'dataFetching', 25);
            await delay(10);
            const allSongs = await fetchAllSongs(accessToken, (progress) => {
              updateLoadingState(`Fetching all your saved songs... (${progress.tracksLength} of ${progress.totalTracks})`, 25 + Math.floor(progress.percentage / 100 * 35), 'dataFetching', 25 + Math.floor(progress.percentage / 100 * 75));
            });
            setUserData(prev => ({ ...prev, 
              allSongs,
              fetched: {...prev.fetched, data: true}  // Mark as fetched when allSongs are fetched
            }));

            updateLoadingState('Fetched all your saved songs!', 60, 'dataFetching', 100);


            // Start unplayables filtering
            updateLoadingState('Finding unplayable tracks...', 65, 'unplayablesFiltering', 5);
            await delay(10);
            setLoading(prev => ({
              ...prev,
              unplayablesFiltering: true
            }));
            const unplayables = allSongs ? await filterUnplayables(allSongs) : [];
            // Update state immediately with unplayables
            setUserData(prev => ({ 
                ...prev, 
                unplayables,
                fetched: {...prev.fetched, unplayables: true}
            }));
            updateLoadingState('Filtered unplayable tracks!', 70, 'unplayablesFiltering', 100);

            // Start language analysis in background
            updateLoadingState('Getting lyrics and analyzing languages...', 75, 'songEnrichment', 5);
            setLoading(prev => ({
              ...prev,
              songEnrichment: true
            }));
            const enrichedSongs = [];
            const chunkSize = 50;
            const totalChunks = Math.ceil((allSongs?.length || 0) / chunkSize);
            
            // Make sure we have a fresh AbortController
            if (!abortController.current) {
              abortController.current = new AbortController();
            }

            for (let i = 0; i < (allSongs?.length || 0); i += chunkSize) {
                const chunk = allSongs.slice(i, i + chunkSize);
                const currentChunk = Math.floor(i / chunkSize) + 1;
                const progressValue = Math.floor((currentChunk / totalChunks) * 100);
                const globalProgressValue = 75 + Math.floor((currentChunk / totalChunks) * 20);

                updateLoadingState(
                    `Getting lyrics and analyzing languages for songs ${i + 1}-${Math.min(i + chunkSize, allSongs.length)} of ${allSongs.length}...`, 
                    globalProgressValue,
                    'songEnrichment',
                    progressValue
                );
                
                await delay(10);
                const enrichedChunk = await enrichSongsWithLyricsAndLanguage(
                    chunk, 
                    geniusAccessToken, 
                    chunkSize,
                    abortController.current?.signal
                );
                enrichedSongs.push(...enrichedChunk);
                
                // Update enrichedSongs progressively
                setUserData(prev => ({ 
                    ...prev, 
                    enrichedSongs: [...enrichedSongs],
                    fetched: {...prev.fetched, enrichedSongs: true}
                }));
            }
            console.log('Enriched Songs: ', enrichedSongs)
            console.log('Incoherent Songs: ', enrichedSongs.filter(song => !song.geniusDeemedCoherent))

            updateLoadingState('Saving your data...', 95);
            await delay(10);

            // Update state with all the data
            const newUserData = { 
              fetched: { global: true, data: true, unplayables: true, enrichedSongs: true}, 
              profile, 
              topTracks, 
              allSongs, 
              unplayables, 
              enrichedSongs 
            };
            setUserData(newUserData);
            localStorage.setItem('user_data', JSON.stringify(newUserData));
            
            updateLoadingState('Complete!', 100);
            await delay(500); // Show completion briefly
            
          } catch (error) {
            console.error('Error fetching Spotify data:', error);
            if (error.name === 'AbortError') {
              console.log('Operation was aborted');
            }
          } finally {
            setLoading({
              global: false,
              dataFetching: false,
              unplayablesFiltering: false,
              songEnrichment: false,
            });
            setLoadingMessage('');
            isFetchingRef.current = false;
          }
        }
      } catch (error) {
        console.error('Error in fetchSpotifyData:', error);
        if (error.name === 'AbortError') {
          console.log('Operation was aborted');
        }
        setLoading({
          global: false,
          dataFetching: false,
          unplayablesFiltering: false,
          songEnrichment: false,
        });
        setLoadingMessage('');
        setProgress({
          global: 0,
          dataFetching: 0,
          unplayablesFiltering: 0,
          songEnrichment: 0
        });
        isFetchingRef.current = false;
      }
    };

    fetchSpotifyData();
  }, [URLparamCode, userData.fetched.global, isCodeUsed]);


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
  
  const progresses = {
    'unplayables': {
      label: "Unplayable tracks",
      progress: userData.unplayables ? 100 : 0,
      colour: "#1ed760"
    },
    'enrichedSongs': {
      label: "Song insights",
      percentage: userData.enrichedSongs ? 100 : 0,
      colour: "#1ab352"
    }
  };

  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <div className="space-y-10">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold text-center leading-tight">
                    {/* The first transformation I tried was to rotate the text. Keeping it in case I want to use it again. */}
                  {/* Find your <span className="inline-block transform -rotate-2"><span className="inline-block bg-gray-350 px-2 py-1 rounded-sm">greyed out</span></span> saved songs that are no longer on <span className="inline-block transform -rotate-2"><span className="inline-block bg-spotify-green text-white px-2 py-1 rounded-md">Spotify</span></span> */}
                    Find your <span className="inline-block transform -rotate-1"><span className="inline-block bg-gray-350 px-2 py-1 rounded-sm transform -skew-x-12">greyed out</span></span> saved songs that are no longer on <span className="inline-block transform -rotate-1"><span className="inline-block bg-spotify-green px-2 py-1 rounded-sm transform -skew-x-12">Spotify</span></span>
                  </h1>
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
                  {userData.fetched.unplayables && (
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
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <div className="space-y-10">
                <h1 className="text-3xl sm:text-5xl font-bold text-center leading-tight">
                  Get some interesting <br /> insights on your songs
                </h1>
                <div>
                {userData.fetched.enrichedSongs && userData.enrichedSongs && (
                  <LanguageAnalysis enrichedSongs={userData.enrichedSongs || []} />
                )} 
                </div>
              </div>
            </main>
          } />
        </Routes>

        {/* Loading progress */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {loading.global && (
            <div className="mt-4 mb-4">
              {/* <Progress 
              stage="Global"
              percentage={progress.global} 
              loading={loading.global}
              message={loadingMessage}
            /> */}
            <Progress 
              stage="Fetching data"
              percentage={progress.dataFetching} 
              loading={loading.global}
            />
            <Progress 
              stage="Filtering unplayables"
              percentage={progress.unplayablesFiltering} 
              loading={loading.unplayablesFiltering}
            />
            <Progress 
              stage="Enriching songs"
              percentage={progress.songEnrichment} 
              loading={loading.songEnrichment}
            />
          </div>
         )}
        {loadingMessage && (
            <div className="mt-2 text-center">
              <p className="text-gray-600">{loadingMessage}</p>
            </div>
          )}
        </div>

        <Footer userData={userData} loading={loading.global} onConnect={connectToSpotify} />
      </Router>
    </>
  )
}

export default App
