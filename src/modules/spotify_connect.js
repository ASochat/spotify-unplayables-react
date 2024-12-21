// Set basic variables
//console.log('START CONNECT.JS');
//console.log(process || 'no process');


export async function redirectToAuthCodeFlow(appClientId, redirectUrl) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    //console.log('clientId:', appClientId, 'verifier:',verifier,'challenge:',challenge);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", appClientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUrl);
    params.append("scope", "user-read-private user-read-email user-top-read user-library-read"); // IMPORTANT TO HAVE THE SCOPE OF WHAT WE WANT
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code, redirectUrl) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUrl); // IDEALLY, THIS SHOULD BE A VARIABLE
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded"},
        body: params,
    });

    const { access_token } = await result.json();

    localStorage.setItem('access_token', access_token);

    return access_token;
}

/****** REFRESH TOKEN ******/
/* Le refresh token n'est pas vraiment nécessaire pour le moment, dans la mesure on ne fetch qu'une fois,
en tout cas pour les unplayables. Quand il s'agîra de garder la data ou de charger plus par économie potentielle de database,
peut être qu'il faudra faire plus d'appels. */
/*
const getRefreshToken = async () => {
    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem('refresh_token');
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId
        }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.accessToken);
    if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
    }
}
*/