//console.log('START FETCH.JS');

export async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", 
        headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Fetched profile!")

    return await result.json();
}

export async function fetchTopTracks(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET", 
        headers: { 
            'Authorization': `Bearer ${token}`,
        }
    });

    const { items } = await result.json()

    const tracks = items.slice(0, 10).map((track) => ({
        artist: track.artists.map((_artist) => _artist.name).join(', '),
        songUrl: track.external_urls.spotify,
        title: track.name,
      }))

    console.log("Fetched top tracks!")

    return tracks;
}

async function returnOffset(offset) {
    return offset;
}

export async function fetchAllSongs(token) {
    // First check if token exists
    if (!token) {
        console.error('No token provided to fetchAllSongs');
        throw new Error('Authentication token is required');
    }

    let offset = 1896;
    let batchSize = 50; 
    var tracks = [];
    var newTracks = [];

    try {
        while (batchSize == 50) {
            console.log(`Fetching tracks with offset ${offset}, token: ${token.substring(0, 10)}...`);
            
            var result = await fetch("https://api.spotify.com/v1/me/tracks?market=NO&limit=50&offset="+offset, {
                method: "GET", 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check if the response is ok
            if (!result.ok) {
                const errorData = await result.json();
                console.error('Spotify API error:', {
                    status: result.status,
                    statusText: result.statusText,
                    error: errorData,
                    offset: offset,
                    hasToken: !!token
                });
                throw new Error(`Spotify API error: ${result.status} ${result.statusText}`);
            }

            let { items } = await result.json();
            
            // console.log(items);

            newTracks = items.slice(0, 50).map((item) => ({
                artist: item.track.artists.map((_artist) => _artist.name).join(', '),
                title: item.track.name,
                added_at: item.added_at.split('T')[0],
                songUrl: item.track.external_urls.spotify,
                is_playable: item.track.is_playable,
                // available_markets: item.track.available_markets
              }))

            //console.log(offset);

            tracks = tracks.concat(await newTracks);

            batchSize = items.length;
            offset += batchSize;

            // returnOffset(offset); // This doesn't work
        }

        console.log("Fetched all songs successfully!");
        return tracks;

    } catch (error) {
        console.error('Error in fetchAllSongs:', error);
        throw error;
    }
}

export async function filterUnplayables(tracks) { 
    
    let unplayables = [];

    for (var i in tracks) {
        if (!tracks[i].is_playable) {
            tracks[i].number = parseInt(i) + 1;
            unplayables.push(tracks[i]);
            // Use Object.assign(itemJSON, json) to add the number in the list
        }
    }

    console.log('Filtered unplayables!')

    return unplayables;
}
