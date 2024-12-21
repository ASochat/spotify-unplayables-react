/////////// TO FIX /////////////////////////////////////////////
// - Post Authorization after the first connection, there's something that doesn't work, perhaps the Promise is not ready yet. I need to refresh for it to work. 
////////////////////////////////////////////////////////////////

/////////// TO DO /////////////////////////////////////////////
// - App: when the userData is not defined (when you load the website for the first time bastically), it doesn't work
// ...because it can't get the specific variable. There's probably something to do with useState and userEffect but I'm blocked for now
//
// - Pass the accessToken to the App instead of having a local storage (but need to have one for refreshes no ?)
//
// - Refresh the main render when userData is fetched (can't use create root, there's probably a refresh root method)
// ...for now I put it in local storage so it seems like it works
//
// - (not important yet) Try / Catch the access token to see if needs to be refreshed, with a refresh Token (or reconnect Data)
// ...but it's also a matter of checking whether we already have the userData (or if we want to make it dynamic, refresh at every
// ...reload which is probably best)
//
// - Change Connect to Spotify to "Refresh Data" if existing userData, using state
//
// - Fetching all songs takes time. We can use offset to do a loader for the user to wait
// ...yet the app won't render until it's ready. Should use a data background refresher instead.
//
// - Remove ?code= after it is fetched (window.location just refreshed infinitely)
//
// - Use effect-hooks (use effect) instead of main to connect to Spotify. And use JSON server to store the data instead of localStorage? Yes but it's not the same data for everyone
////////////////////////////////////////////////////////////////


console.log('STARTING MAIN.JSX')

// Import main modules
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { promisify } from 'util.promisify'
// CAN'T REQUIRE MODULES LIKE ON NODE --> Module "util" has been externalized for browser compatibility. Cannot access "util.promisify" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
import './index.css'
import App from './App.jsx'
import dotenv from 'dotenv'

// Import created modules
import { getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'

let refreshCounter = 0;


////// TRYING TO GET END VARIABLES ///////
// dotenv doesn't work because process it not defined and I'm tired of it.  
// try {
//   dotenv.config()
// } catch (error) {
//   console.error('Error loading .env file:', error)
// }
// console.log(process.env);

// THIS DOESN'T WORK EITHER, the loaded env is not the one I chose (and btw I don't know where it found it)
// const env = await import.meta.env;
// console.log(env)
// console.log(BASE_URL, env.BASE_URL);
// console.log(SPOTIFY_APP_CLIENT_ID, env.SPOTIFY_APP_CLIENT_ID);

//==> My best take is that main.jsx loads from the frontend, and process is a backend variable. I just need to advance in the course to set up the server side of react

// There should be something here to check token with a try/catch


// SPOTIFY GET TOKEN IF NOT DEFINED AND USER CODE VALID
const appClientId = 'e61711cbd130408abf2d471288b77e87';
const redirectUrl = 'http://localhost:5174/';
//localStorage.removeItem('access_token'); // TEMPORARY ONLY FOR DEBUGGING
const accessToken = localStorage.getItem("access_token");
console.log("Access token is stored at: " + accessToken);
const params = new URLSearchParams(window.location.search)
const URLparamCode = params.get('code');
const storedUsedCode = localStorage.getItem('spotify_user_code')

// THE USER CODE REMAINS IN THE URL. SHOULD PROBABLY REDIRECT TO PAGE WITHOUT IT, BUT... WHEN I'LL HAVE A DATABASE
const isCodeUsed = URLparamCode === storedUsedCode;

// I had to define all userData properties since they are used in App.jsx. 
// There's probably a better way, either through class, or JSON loading
let userData = localStorage.getItem('user_data')?
  JSON.parse(localStorage.getItem('user_data'))
  : { 
    fetched: false,
    profile: {displayName: '', email: '', country:'', external_urls: {spotify: ''}, images: []}, 
    topTracks: [], 
    allSongs: [], 
    unplayables: [],
  }

console.log('Post definition userData: ', userData);

const refresh = (userData) => {
  refreshCounter += 1;
  console.log('refreshing the app:', refreshCounter)
  console.log('In main refresh user data:', userData)
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App userData={userData} />
    </StrictMode>,
  )
}

// Théoriquement, on aurait même pas besoin de faire un localStorage, il faut juste passer la variable à l'app
// Ici on utilise userData.fetched mais il faudrait plutôt un évènement de refresher
if (!userData.fetched && !isCodeUsed) {
  // REMOVED CONDITION (!accessToken || accessToken === 'undefined')
  // since we use the accessToken only once - for now
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

    console.log('Post then unplayables, probably still waiting:', unplayables)

    Promise.all([profile, topTracks, allSongs, unplayables]).then(([profile, topTracks, allSongs, unplayables]) => {
      console.log('Starting promise to pass all user data')
      userData = { fetched: true, profile, topTracks, allSongs, unplayables }  
      console.log('After Promise userData:', userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
      // WARNING: Apparently I shouldn't re-render, I don't know if there's a refresh function, of through const, IDK. "You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it."
      // Perhaps simply trough a "else"? YES IT WORKS!
      refresh(userData);
    })

    // THE PROMISE SHOULD PROBABLY HAVE THIS FORM BUT BE HANDLED WITH THE SPOTIFY FETCH DIRECTLY
    // const songsPromise = new Promise((resolve, reject) => {
    //   fetchAllSongs(accessToken)
    // })
    // Again a problem with unplayables... Promise doesn't work
    // const unplayables = filterUnplayables(allSongs) // Like this it just renders an empty array since allSongs is not defined
    // const unplayables = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve(filterUnplayables(allSongs))
    //   }, 2000)
    // })
    // allSongs.then(songs => {
    //   console.log('Finished fetching all songs!')
    //   const unplayables = filterUnplayables(songs)
    //   console.log('Post fetching songs unplayables:', unplayables);
    // }).catch(error => console.error('Failed to fetch all songs', error))
  })
  // can't reuse the same user code, storing it local storage to avoid confusion
  localStorage.setItem('spotify_user_code', URLparamCode);
} else {
  refresh(userData);
}

// refresh(userData);

// Making repeated calls to the render method is not the recommended way to re-render components.
// It works, but it's not the best
// setInterval(() => {
//   refresh()
//   counter += 1
// }, 1000)

