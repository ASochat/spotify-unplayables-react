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
        // Separate title and artist processing
        let cleanTitle = options.optimizeQuery 
            ? options.title
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
                .trim()
            : options.title;

        // Create search query by combining cleaned title and original artist
        let searchQuery = `${cleanTitle} ${options.artist}`;

        // console.log('Original title:', options.title);
        // console.log('Cleaned title:', cleanTitle);
        // console.log('Final search query:', searchQuery);

        // Use our proxy server instead of direct Genius API call
        const searchResponse = await axios.get(`http://localhost:3000/api/genius/search`, {
            params: {
                q: searchQuery,
                access_token: options.apiKey
            }
        });

        const hits = searchResponse.data.response.hits;
        // console.log("results: ", hits)
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

