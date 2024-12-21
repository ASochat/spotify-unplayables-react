export async function populateUI(profile) {
    console.log('profile:',profile);
    console.log(profile.country);
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
    document.getElementById("imgUrl").innerText = profile.images[0]?.url ?? '(no profile image)';
}

export async function populateTracks(tracks) {  

    for (var i in tracks) {
        document.getElementById("track"+i+"_title").innerText = tracks[i].title;
        document.getElementById("track"+i+"_artist").innerText = tracks[i].artist;
    }

}

export async function populateUnplayables(tracks) {  

    unplayablesTitles

    let output = document.getElementById("unplayablesTitles");
    let html = '';

    tracks.forEach((track, index) =>{
        console.log(track)
        html += `
            <tr>
                <td>${track.number}</td>
                <td>${track.artist}</td>
                <td>${track.title}</td>
                <td>${track.added_at}</td>
            </tr>
        `;
    })

    output.innerHTML = html;

}