import { load } from "cheerio"
import { franc } from 'franc-min'
import { iso6393 } from 'iso-639-3'
import ISO6391 from 'iso-639-1'
import axios from 'axios'
// We're using our own Genius API wrapper instead of genius-lyrics-api
import { searchSong, getSongDetails } from './genius_api'
// import { getSong } from 'genius-lyrics-api'

// Get the appropriate API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV) {
    console.log('API_URL in lyrics_and_language.js:', API_URL);
}

// We don't use this function anymore because blocked by Cloudflare in remote live
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

// We used to use this function to get the language from the lyrics, but scrapeLyrics doesn't work in remote live, blocked by Cloudflare
const getLanguageFromLyrics = async (lyrics) => {
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

export async function enrichSongsWithGenius(songsList, geniusAccessToken, batchSize, signal) {
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
                                lyricsUrl: geniusSong.url,
                                language
                            };
                        }

                        // We don't fetch lyrics because blocked by Cloudflare in remote live
                        // lyrics = await scrapeLyrics(geniusSong.url);
                        try {
                            const songDetails = await getSongDetails(geniusSong.id, geniusAccessToken);
                            // console.log(`songDetails for ${geniusSong.title} by ${geniusSong.artist}: `, songDetails)

                            // if (lyrics === "Instrumental") {
                            //     return "Instrumental";
                            // }
                            
                            // Log the incoming data
                            // Log the search attempt
                            const languageCode = songDetails.languageCode

                            const language = languageCode ? ISO6391.getName(languageCode) : 'Unknown';

                            return {
                                ...song,
                                geniusTitle: geniusSong.title,
                                geniusArtist: geniusSong.artist,
                                geniusCoherence: geniusSong.geniusCoherence,
                                geniusDeemedCoherent: geniusSong.geniusDeemedCoherent,
                                lyricsUrl: geniusSong.url,
                                description: songDetails.description,
                                language: language
                            };
                        } catch (error) {
                            return {
                                ...song,
                                geniusTitle: geniusSong.title,
                                geniusArtist: geniusSong.artist,
                                geniusCoherence: geniusSong.geniusCoherence,
                                geniusDeemedCoherent: geniusSong.geniusDeemedCoherent,
                                lyricsUrl: geniusSong.url,
                                description: 'Error getting song Details',
                                language: 'Error getting song Details'
                            };
                        }
                    }
                    return {
                        ...song,
                        lyricsUrl: 'Genius doesn\'t have lyrics for this song',
                        language: 'Genius doesn\'t have lyrics for this song'
                    };
                } catch (error) {
                    if (signal?.aborted) {
                        throw new Error('Process cancelled');
                    }
                    console.error(`Error processing ${song.title}:`, error);
                    return {
                        ...song,
                        lyricsUrl: 'Error getting Genius',
                        language: 'Error getting Genius'
                    };
                }
            })
        );

        enrichedSongs.push(...batchResults);
        console.log(`Processed ${enrichedSongs.length} of ${songsList.length} songs`);
    }
    // console.log("enrichedSongs: ", enrichedSongs)
    // console.log("incoherentSongs: ", incoherentSongs)
    return enrichedSongs;
}


