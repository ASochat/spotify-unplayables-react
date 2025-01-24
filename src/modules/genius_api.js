import axios from 'axios';

/**
 * Search for a song on Genius
 * @param {Object} options
 * @param {string} options.apiKey - Genius API key
 * @param {string} options.title - Song title
 * @param {string} options.artist - Artist name
 * @param {boolean} options.optimizeQuery - Whether to optimize the search query
 * @returns {Promise<Object|null>} Song data or null if not found
 */
export const searchSong = async (options) => {
    try {
        let searchQuery = options.optimizeQuery 
            ? `${options.title} ${options.artist}`.toLowerCase()
                .replace(/ *\([^)]*\) */g, '') // Remove content in parentheses
                .replace(/ *\[[^\]]*\] */g, '') // Remove content in brackets
                .replace(/feat.|ft./g, '')      // Remove feat. or ft.
                .replace(/\s+/g, ' ').trim()    // Remove extra spaces
            : `${options.title} ${options.artist}`;

        // Use our proxy server instead of direct Genius API call
        const searchResponse = await axios.get(`http://localhost:3000/api/genius/search`, {
            params: {
                q: searchQuery,
                access_token: options.apiKey
            }
        });

        const hits = searchResponse.data.response.hits;
        if (hits.length === 0) return null;

        // Get the first result
        const song = hits[0].result;
        
        return {
            id: song.id,
            title: song.title,
            url: song.url,
            albumArt: song.song_art_image_url,
            artist: song.primary_artist.name,
            path: song.path,
            lyrics_state: song.lyrics_state
        };
    } catch (error) {
        console.error('Error searching song:', error);
        throw error;
    }
};

