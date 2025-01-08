# Find your unplayable Spotify tracks at once. 

Website running on spotify.soch.at.

Built on React. 

Any suggestions? File an issue or contact me directly at antoine@soch.at.

///////// TO DO //////////

- Pass the accessToken to the App instead of having a local storage (not a priority)

- (not important yet) Try / Catch the access token to see if needs to be refreshed, with a refresh Token (or reconnect Data) but it's also a matter of checking whether we already have the userData (or if we want to make it dynamic, refresh at every reload which is probably best)

- Change "Connect to Spotify" to "Refresh Data" if existing userData, using state

- Remove ?code= after it is fetched (window.location just refreshed infinitely). That should probably go through a redirection.

- Get the number of times it has been used, and save that to the server - should post a new "id" whenever it has been used. 

- Loading circle: we don't have the number of tracks. There may be a way to get the first and last track, with a check a dichotomy, but for now we just use a dummy loading bar based on 3000 songs saved. 

- Loading circle: improve design.

- Add a comment interface below. 

- sass compile in build mode: https://blog.logrocket.com/using-bootstrap-react-tutorial-examples/

//////////////////////////