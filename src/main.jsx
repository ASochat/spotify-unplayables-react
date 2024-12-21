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

const refresh = () => {
  // refreshCounter += 1;
  // console.log('refreshing the app:', refreshCounter)
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

refresh();

// Making repeated calls to the render method is not the recommended way to re-render components.
// It works, but it's not the best
// setInterval(() => {
//   refresh()
//   counter += 1
// }, 1000)

