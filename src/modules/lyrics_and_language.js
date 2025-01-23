// Import for Genius API + Language detection
import { getSong } from 'genius-lyrics-api'
import { load } from "cheerio"
import { franc } from 'franc-min'
import { iso6393 } from 'iso-639-3'
import stringSimilarity from 'string-similarity'

const scrapeLyrics = async (url) => {
  try {
    const { data } = await axios.get(url);

    const $ = load(data);

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
    return null;
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

// Convert forEach to map and use Promise.all to wait for all operations to complete
export async function enrichSongsWithLyricsAndLanguage(songsList, geniusAccessToken) {

    const enrichedSongs = await Promise.all(
        songsList.map(async (song) => {
            const options = {
                apiKey: geniusAccessToken,
                title: song.title,
                artist: song.artist,
                optimizeQuery: true
            };
            
            try {
                const geniusSong = await getSong(options);
                if (geniusSong && geniusSong.url) {
                    const geniusTitle = geniusSong.title;
                    const geniusTitleCoherence = await getCoherenceScore(song.title+' by '+song.artist, geniusSong.title);
                    // const geniusArtist = geniusSong.primary_artist.name;
                    const geniusDeemedCoherent = geniusTitleCoherence > 0.3;
                        if (!geniusDeemedCoherent) {
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

    // console.log(enrichedSongs);
    return enrichedSongs;
};

