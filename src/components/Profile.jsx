const Profile = (props) => {
    const profile = {
      userId: props.profile.display_name,
      country: props.profile.country,
      email: props.profile.email,
      link: props.profile.external_urls.spotify //-- CAN'T READ external_urls properties because it's sometimes undefined
    };
  
    if (props.profile.images.length > 0) {
      profile.avatar = props.profile.images[Ø];
    } else {
      profile.avatar = 'No avatar available';
    }
  
    // console.log('in Profile component profile:', profile);
  
    return (
      <div className="container mt-5 pr-5">
        <h2>Logged in as </h2>
        <ul>
          <li>User ID: { profile.userId }</li>
          <li>country: { profile.country }</li>
          <li>Email: { profile.email }</li>
          <li>Link: <a id="url" href="#">{ profile.link }</a></li>
          <li>file Image: { profile.avatar }</li>
        </ul>
      </div>
    )
  }

export default Profile;