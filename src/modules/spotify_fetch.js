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

export async function fetchAllSongs(token, updateProgress) {
    if (!token) {
        console.error('No token provided to fetchAllSongs');
        throw new Error('Authentication token is required');
    }

    // Get user's country from profile
    const profile = await fetchProfile(token);
    const market = profile.country || 'US'; // Fallback to US if country not found
    console.log(`Using market: ${market}`);

    let offset = 1891;
    let batchSize = 50;
    let totalTracks = 0;
    var tracks = [];

    try {
        // Make initial request to get total number of tracks
        const initialResult = await fetch(`https://api.spotify.com/v1/me/tracks?market=${market}&limit=1`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!initialResult.ok) {
            throw new Error(`Spotify API error: ${initialResult.status} ${initialResult.statusText}`);
        }

        const initialData = await initialResult.json();
        totalTracks = initialData.total;
        console.log(`Total tracks to fetch: ${totalTracks}`);

        while (batchSize == 50) {
            // console.log(`Fetching tracks with offset ${offset}, token: ${token.substring(0, 10)}...`);
            
            var result = await fetch(`https://api.spotify.com/v1/me/tracks?market=${market}&limit=50&offset=${offset}`, {
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
            
            const newTracks = items.slice(0, 50).map((item) => ({
                artist: item.track.artists.map((_artist) => _artist.name).join(', '),
                title: item.track.name,
                added_at: item.added_at.split('T')[0],
                songUrl: item.track.external_urls.spotify,
                is_playable: item.track.is_playable,
            }));

            tracks = tracks.concat(newTracks);
            batchSize = items.length;
            offset += batchSize;

            // Calculate and update progress
            const progress = {
                percentage: Math.round((tracks.length / totalTracks) * 100),
                tracksLength: tracks.length,
                totalTracks: totalTracks
            };
            if (updateProgress) {
                updateProgress(progress);
            }
        }

        console.log(`Fetched all ${tracks.length}/${totalTracks} songs successfully!`);
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
