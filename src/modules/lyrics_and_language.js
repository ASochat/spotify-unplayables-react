
import { load } from "cheerio"
import { franc } from 'franc-min'
import { iso6393 } from 'iso-639-3'
import stringSimilarity from 'string-similarity'
import axios from 'axios'
// We're using our own Genius API wrapper instead of genius-lyrics-api
import { searchSong } from './genius_api'
// import { getSong } from 'genius-lyrics-api'

const scrapeLyrics = async (url) => {
  try {
    // Use our proxy server instead of direct Genius URL
    const response = await axios.get(`http://localhost:3000/api/lyrics?url=${encodeURIComponent(url)}`);
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

const getCoherenceScore = async (title1, title2) => {
    const coherenceScore = stringSimilarity.compareTwoStrings(title1, title2);
    return coherenceScore;
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

export async function enrichSongsWithLyricsAndLanguage(songsList, geniusAccessToken) {
    // Process songs in smaller batches to avoid rate limiting
    const batchSize = 10;
    const timeBetweenBatches = 500;
    const enrichedSongs = [];
    const incoherentSongs = [];

    for (let i = 0; i < songsList.length; i += batchSize) {
        const batch = songsList.slice(i, i + batchSize);
        
        // Add delay between batches
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, timeBetweenBatches));
        }

        const batchResults = await Promise.all(
            batch.map(async (song) => {
                const options = {
                    apiKey: geniusAccessToken,
                    title: song.title,
                    artist: song.artist,
                    optimizeQuery: true
                };
                
                try {
                    const geniusSong = await getSongWithRetry(options);
                    if (geniusSong && geniusSong.url) {
                        const geniusTitle = geniusSong.title;
                        const geniusTitleCoherence = await getCoherenceScore(song.title+' '+song.artist, geniusSong.title+' '+geniusSong.artist);
                        const geniusDeemedCoherent = geniusTitleCoherence > 0.3;
                        // console.log("title: ", song.title,
                        //     "artist: ", song.artist,
                        //     "geniusTitle: ", geniusSong.title,
                        //     "geniusArtist: ", geniusSong.artist,
                        //     "geniusTitleCoherence: ", geniusTitleCoherence,
                        //     "geniusDeemedCoherent: ", geniusDeemedCoherent)
                        
                        if (!geniusDeemedCoherent) {
                            incoherentSongs.push({
                                "title": song.title,
                                "artist": song.artist,
                                "geniusTitle": geniusSong.title,
                                "geniusArtist": geniusSong.artist,
                                "geniusTitleCoherence": geniusTitleCoherence,
                                "geniusDeemedCoherent": geniusDeemedCoherent
                            })
                            return {
                                ...song,
                                geniusTitle,
                                geniusTitleCoherence,
                                geniusDeemedCoherent,
                                lyrics: "Genius deemed incoherent",
                                language: "Genius deemed incoherent"
                            };
                        }

                        const lyrics = await scrapeLyrics(geniusSong.url);
                        try {
                            const language = await getLanguage(lyrics);
                            return {
                                ...song,
                                geniusTitle,
                                geniusTitleCoherence,
                                geniusDeemedCoherent,
                                lyricsUrl: geniusSong.url,
                                lyrics,
                                language
                            };
                        } catch (error) {
                            return {
                                ...song,
                                geniusTitle,
                                geniusTitleCoherence,
                                geniusDeemedCoherent,
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


