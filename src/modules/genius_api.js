import axios from 'axios';
import stringSimilarity from 'string-similarity';

/**
 * Search for a song on Genius
 * @param {Object} options
 * @param {string} options.apiKey - Genius API key
 * @param {string} options.title - Song title
 * @param {string} options.artist - Artist name
 * @param {boolean} options.optimizeQuery - Whether to optimize the search query
 * @returns {Promise<Object|null>} Song data or null if not found
 */

const getCoherenceScore = async (title1, title2) => {
    const coherenceScore = stringSimilarity.compareTwoStrings(title1, title2);
    return coherenceScore;
};

const optimizeQuery = (title, artist) => {
     // Separate title and artist processing
     const cleanTitle = title
         // Originally we had this lowercase but removed it because useless
         // .toLowerCase()

         // Remove featuring artists
         .replace(/feat\.|ft\.|featuring/g, '')
         
         // Remove version indicators with their preceding parentheses or dash
         .replace(/(?: - | \().*(?:remastered|re-?master).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:radio\s?edit).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:live).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:remix|mix).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:acoustic).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:unplugged).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:version).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:remake).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:cover).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:demo).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:instrumental).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:karaoke).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:extended).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:original).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:bonus\s?track).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:deluxe).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:single).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:album\s?version).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:anniversary).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:alternative).*?(?:\)|$)/gi, '')
         .replace(/(?: - | \().*(?:edit).*?(?:\)|$)/gi, '')
         
         // Only remove years when they're part of a version indicator
         .replace(/(?: - | \().*(?:19|20)\d{2}(?:\s+(?:remaster|version|mix|edit|remix))?.*?(?:\)|$)/gi, '')
         
         // Clean up any leftover empty parentheses and extra spaces
         .replace(/\(\s*\)/g, '')
         .replace(/\s+/g, ' ')
         .trim();

 // No cleaning of artist name for this part
    const cleanArtist = artist

    // Create search query by combining cleaned title and original artist
    const searchQuery = `${cleanTitle} ${cleanArtist}`;
    return {searchQuery, cleanTitle, cleanArtist};
}

const optimizeMoreQuery = (title, artist) => {
    // This is a more aggressive optimization that removes more of the title and artist
    const cleanTitle = optimizeQuery(title, artist).cleanTitle
        .replace(/[-\.]/g, '')   // Remove dashes and periods
        .replace(/(?:\s-\s|\s|\()?from\s+[^)\n]+\)?/gi, '')  // Remove "From XXX" in various formats
        .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
        .trim();                 // Remove leading/trailing spaces
    const cleanArtist = optimizeQuery(title, artist).cleanArtist
        .replace(/feat\.|ft\.|featuring/g, '')
        .replace(/(?:,|&|\sand\s).*$/, '')  // Remove everything after comma, &, or "and"
        .trim();
    const searchQuery = `${cleanTitle} ${cleanArtist}`;
    return {searchQuery, cleanTitle, cleanArtist};
}

// Get the appropriate API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV) {
    console.log('API_URL in genius_api.js:', API_URL);
}

export const searchSong = async (options) => {
    const CoherenceScoreThreshold = 0.33;  
    // Always use port 3001 for API calls
    // const API_URL = 'http://localhost:3001';
    // const API_URL = import.meta.env.API_URL || 'http://localhost:3000'; // This was the previous way to get the API_URL
    // console.log('Options in genius_api.js searchSong: ', options);
    // console.log('API_URL in genius_api.js:', API_URL);
    try {
        // Separate title and artist processing
        let searchQuery = options.optimizeQuery 
            ? optimizeQuery(options.title, options.artist).searchQuery
            : `${options.title} ${options.artist}`;

        // console.log('Original title:', options.title);
        // console.log('Cleaned title:', cleanTitle);
        // console.log('Final search query:', searchQuery);

        // Use our proxy server instead of direct Genius API call
        let searchResponse = await axios.get(`${API_URL}/api/genius/search`, {
            params: {
                q: searchQuery,
                access_token: options.apiKey
            }
        });

        // console.log("Search response: ", searchResponse);

        let hits = searchResponse.data.response.hits;

        if (hits.length === 0) {
            console.log("No results found for: ", searchQuery, "- trying again with re-optimized query");
            searchQuery = optimizeMoreQuery(options.title, options.artist).searchQuery;
            console.log("Trying again with search query: ", searchQuery);
            searchResponse = await axios.get(`${API_URL}/api/genius/search`, {
                params: {
                    q: searchQuery,
                    access_token: options.apiKey
                }
            });
            hits = searchResponse.data.response.hits;
            if (hits.length === 0) {
                console.log("Again no results found for: ", searchQuery, "- giving up");
                return null;
            }
        }   

        // Get the first result
        // Potentially we could return multiple results if the first is not coherent.
        let song = hits[0].result;

        if (song && song.url) {
            let geniusCoherence = await getCoherenceScore(song.title+' '+song.primary_artist.name, options.title+' '+options.artist);
            let geniusDeemedCoherent = geniusCoherence > CoherenceScoreThreshold;
            // console.log("title: ", options.title,
            //     "artist: ", options.artist,
            //     "geniusTitle: ", geniusSong.title,
            //     "geniusArtist: ", song.primary_artist.name,
            //     "geniusCoherence: ", geniusCoherence,
            //     "geniusDeemedCoherent: ", geniusDeemedCoherent)
            
            if (!geniusDeemedCoherent) {
                console.log("Song deemed incoherent: ", options.title, " by ", options.artist, "with search query: ", searchQuery, " - Genius returned: ", song.title, " by ", song.primary_artist.name, " - Coherence score: ", geniusCoherence, "All Genius hits returned: ", hits, " - Retrying...");
                // Need to retry with a different search query
                searchQuery = optimizeMoreQuery(options.title, options.artist).searchQuery;
                console.log("Trying again with search query: ", searchQuery);  
                searchResponse = await axios.get(`${API_URL}/api/genius/search`, {
                    params: {
                        q: searchQuery,
                        access_token: options.apiKey
                    }
                });
                hits = searchResponse.data.response.hits;
                if (hits.length === 0) {
                    console.log("No results found for: ", searchQuery, "- giving up");
                    return null;
                }
                song = hits[0].result;
                geniusCoherence = await getCoherenceScore(song.title+' '+song.primary_artist.name, options.title+' '+options.artist);
                geniusDeemedCoherent = geniusCoherence > CoherenceScoreThreshold;
                if (!geniusDeemedCoherent) {
                    console.log("Song deemed incoherent for the 2nd time: ", options.title, " by ", options.artist, "with search query: ", searchQuery, " - Genius returned: ", song.title, " by ", song.primary_artist.name, " - Coherence score: ", geniusCoherence, "All Genius hits returned: ", hits, " - Checking 2nd result...");
                    // Try with 2nd result
                    song = hits[1].result;
                    geniusCoherence = await getCoherenceScore(song.title+' '+song.primary_artist.name, options.title+' '+options.artist);
                    geniusDeemedCoherent = geniusCoherence > CoherenceScoreThreshold;
                    if (!geniusDeemedCoherent) {
                        console.log("Song deemed incoherent for the 3rd time: ", options.title, " by ", options.artist, "with the 2nd result in the hits", " - Genius returned: ", song.title, " by ", song.primary_artist.name, " - Coherence score: ", geniusCoherence, "All Genius hits returned: ", hits, " - Giving up");
                    }
                }
            }

            return {
                id: song.id,
                title: song.title,
                url: song.url,
                albumArt: song.song_art_image_url,
                artist: song.primary_artist.name,
                path: song.path,
                lyricsState: song.lyrics_state,
                searchQuery: searchQuery,
                geniusCoherence: geniusCoherence,
                geniusDeemedCoherent: geniusDeemedCoherent
            };
        }
    } catch (error) {
        console.error('Error searching song:', error);
        throw error;
    }
};

const domToHtml = (node) => {
    if (typeof node === 'string') return node;
    if (!node) return '';
    
    if (Array.isArray(node)) {
        return node.map(child => domToHtml(child)).join('');
    }

    const { tag, children, attributes = {} } = node;
    if (!tag) return '';
    
    // Skip image tags
    if (tag === 'img') return '';

    const attrs = Object.entries(attributes)
        .map(([key, value]) => ` ${key}="${value}"`)
        .join('');

    return `<${tag}${attrs}>${domToHtml(children)}</${tag}>`;
};

export const getSongDetails = async (songId, apiKey) => {
    try {
        const response = await axios.get(`${API_URL}/api/genius/songs`, {
            params: {
                songId,
                access_token: apiKey
            }
        });
        const songDetails = response.data.response.song;
        
        let description = domToHtml(songDetails.description.dom);

        // console.log(`description of song: ${songDetails.title} by ${songDetails.artist} is: `, description)
        
        // Set description to undefined if it's just a question mark
        if (description === '?' || description.trim() === '?') {
            description = undefined;
        }
        
        return {
            id: songId,
            title: songDetails.title,
            artist: songDetails.artist,
            description: description,
            languageCode: songDetails.language
        }
    } catch (error) {
        console.error('Error getting song details:', error);
        throw error;
    }
}