//console.log('START FETCH.JS');

export async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", 
        headers: { Authorization: `Bearer ${token}` }
    });

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

    return tracks;
}

async function returnOffset(offset) {
    return offset;
}

export async function fetchAllSongs(token) {

    let offset = 1800;
    let batchSize = 50; 
    var tracks = [];
    var newTracks = [];  // Holds new batch of tracks

    while (batchSize == 50) {
        // We should use offset to show a loading indicator to users
        // console.log(offset)

        var result = await fetch("https://api.spotify.com/v1/me/tracks?market=NO&limit=50&offset="+offset, {
            method: "GET", 
            headers: { 
                'Authorization': `Bearer ${token}`,
            }
        })

        let { items } = await result.json()

        console.log(items);

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

    return tracks;
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

    // console.log('In function unplayables', unplayables)

    return unplayables;
}


export async function fetchLyricsAndDetectLanguage(track, artist) {
    const BASE_MATCH_URL = "https://api.musixmatch.com/ws/1.1/matcher.lyrics.get";

    try {
        const params = {
            q_track: track,
      q_artist: artist,
      apikey: "YOUR_API_KEY",
    };

    const response = await axios.get(BASE_MATCH_URL, { params });

    if (response.status === 200) {
      const data = response.data;
      const lyrics = String(data.message.body.lyrics.lyrics_body);
      console.log(franc(lyrics));
    } else {
      console.log("Failed to fetch lyrics, status code:", response.status);
    }
    } catch (error) {
        console.error("Error fetching lyrics:", error.message);
    }
};
