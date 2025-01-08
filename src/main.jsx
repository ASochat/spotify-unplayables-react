console.log('STARTING MAIN.JSX')

// Import main modules
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { promisify } from 'util.promisify'
// CAN'T REQUIRE MODULES LIKE ON NODE --> Module "util" has been externalized for browser compatibility. Cannot access "util.promisify" in client code. See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
// import './index.css'
import App from './App.jsx'
import dotenv from 'dotenv'

// Import created modules
import { getAccessToken } from './modules/spotify_connect'
import { fetchAllSongs, fetchProfile, fetchTopTracks, filterUnplayables } from './modules/spotify_fetch.js'

let refreshCounter = 0;

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

