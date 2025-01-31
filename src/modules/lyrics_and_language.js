import { load } from "cheerio"
import { franc } from 'franc-min'
import { iso6393 } from 'iso-639-3'
import axios from 'axios'
// We're using our own Genius API wrapper instead of genius-lyrics-api
import { searchSong } from './genius_api'
// import { getSong } from 'genius-lyrics-api'

// Always use port 3001 for API calls
const API_URL = 'http://localhost:3001';
// const API_URL = import.meta.env.API_URL || 'http://localhost:3000'; // This was the previous way to get the API_URL
console.log('API_URL in lyrics_and_language.js:', API_URL);

const scrapeLyrics = async (url) => {
  try {
    // Use our proxy server instead of direct Genius URL
    const response = await axios.get(`${API_URL}/api/lyrics?url=${encodeURIComponent(url)}`);
    const html = response.data;

    const $ = load(html);

    let lyrics = "";

    $("div[data-lyrics-container]").each((i, elem) => {
      const snippet = $(elem)
        .html()
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<[^>]+>/g, "");

      lyrics += snippet.trim() + "\n\n";
    });

    if (!lyrics) {
    //   console.log("No letters found.");
      return "Instrumental";
    }

    return lyrics.trim();
  } catch (error) {
    console.error("Error while scraping:", error.message);
    // return null;
    throw error;
  }
};

const getLanguage = async (lyrics) => {
    if (lyrics === "Instrumental") {
        return "Instrumental";
    }
    const languageCode = franc(lyrics);
    const language = iso6393.find(lang => lang.iso6393 === languageCode);
    return language ? language.name : 'Unknown';
    // return language;
};

// Create a custom version of getSong that includes rate limiting
const getSongWithRetry = async (options, retryCount = 0) => {
    try {
        const result = await searchSong(options);
        return result;
    } catch (error) {
        // That's an addition from Cursor in case of a 'Too many requests' error. Not sure if necessary
        console.log("Retry getting song: ", error) 
        // If we hit rate limit (429) and haven't retried too many times
        if (error.response?.status === 429 && retryCount < 3) {
            // Wait for 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            return searchSongWithRetry(options, retryCount + 1);
        }
        throw error;
    }
};

export async function enrichSongsWithLyricsAndLanguage(songsList, geniusAccessToken, batchSize, signal) {
    // Process songs in smaller batches to avoid rate limiting.
    // An idea could be divide this by 2 each time there's an error. 
    // const batchSize = 20; => now a function parameter
    const timeBetweenBatches = 100;
    const enrichedSongs = [];
    const incoherentSongs = [];

    for (let i = 0; i < songsList.length; i += batchSize) {
        // Check if the process was cancelled
        if (signal?.aborted) {
            console.log('Lyrics enrichment process cancelled');
            throw new Error('Process cancelled');
        }

        const batch = songsList.slice(i, i + batchSize);
        
        // Add delay between batches
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, timeBetweenBatches));
        }

        const batchResults = await Promise.all(
            batch.map(async (song) => {
                // Check for cancellation before each song
                if (signal?.aborted) {
                    throw new Error('Process cancelled');
                }

                const options = {
                    apiKey: geniusAccessToken,
                    title: song.title,
                    artist: song.artist,
                    optimizeQuery: true
                };
                
                try {
                    const geniusSong = await getSongWithRetry(options);
                    let lyrics = "";
                    let language = "";

                    if (geniusSong && geniusSong.url) {      
                        if (!geniusSong.geniusDeemedCoherent) {
                            // Really necessary? Can just filter out the final result...
                            incoherentSongs.push({
                                "title": song.title,
                                "artist": song.artist,
                                "geniusTitle": geniusSong.title,
                                "geniusArtist": geniusSong.artist,
                                "geniusCoherence": geniusSong.geniusCoherence,
                                "geniusDeemedCoherent": geniusSong.geniusDeemedCoherent,
                                "searchQuery": geniusSong.searchQuery
                            })
                            const lyrics = "Genius deemed incoherent";
                            const language = "Genius deemed incoherent";
                            return {
                                ...song,
                                geniusTitle: geniusSong.title,
                                geniusArtist: geniusSong.artist,
                                geniusCoherence: geniusSong.geniusCoherence,
                                geniusDeemedCoherent: geniusSong.geniusDeemedCoherent,
                                lyrics,
                                language
                            };
                        }

                        lyrics = await scrapeLyrics(geniusSong.url);
                        try {
                            const language = await getLanguage(lyrics);
                            return {
                                ...song,
                                geniusTitle: geniusSong.title,
                                geniusArtist: geniusSong.artist,
                                geniusCoherence: geniusSong.geniusCoherence,
                                geniusDeemedCoherent: geniusSong.geniusDeemedCoherent,
                                lyricsUrl: geniusSong.url,
                                lyrics,
                                language
                            };
                        } catch (error) {
                            return {
                                ...song,
                                geniusTitle: geniusSong.title,
                                geniusArtist: geniusSong.artist,
                                geniusCoherence: geniusSong.geniusCoherence,
                                geniusDeemedCoherent: geniusSong.geniusDeemedCoherent,
                                lyricsUrl: geniusSong.url,
                                lyrics,
                                language: 'Error getting language'
                            };
                        }
                    }
                    return {
                        ...song,
                        lyrics: 'Genius doesn\'t have lyrics for this song',
                        language: 'Genius doesn\'t have lyrics for this song'
                    };
                } catch (error) {
                    if (signal?.aborted) {
                        throw new Error('Process cancelled');
                    }
                    console.error(`Error processing ${song.title}:`, error);
                    return {
                        ...song,
                        lyrics: 'Error getting lyrics',
                        language: 'Error getting lyrics'
                    };
                }
            })
        );

        enrichedSongs.push(...batchResults);
        console.log(`Processed ${enrichedSongs.length} of ${songsList.length} songs`);
    }
    console.log("enrichedSongs: ", enrichedSongs)
    console.log("incoherentSongs: ", incoherentSongs)
    return enrichedSongs;
}

export async function getLyrics(url) {
  try {
    const response = await axios.get(`${API_URL}/api/lyrics?url=${encodeURIComponent(url)}`);
    const html = response.data;
    // ... rest of your function
  } catch (error) {
    // ... error handling
  }
}


