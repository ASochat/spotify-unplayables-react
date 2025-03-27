import Connecter from './Connecter.jsx'
const Footer = ({ userData, loading, onConnect, handleLogout }) => {
    return (
      <footer className="mt-auto">
        <div>
          <Connecter onClick={onConnect} loading={loading} userData={userData} handleLogout={handleLogout}/>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-350">
          <p>
            Made with love by Antoine Sochat. Website:  
            <a 
              href="https://soch.at" 
              className="hover:text-spotify-green-dark transition-colors duration-200 ml-1 underline"
            >
              soch.at
            </a>
            . Any suggestion: 
            <a 
              href="mailto:antoine@soch.at"
              className="hover:text-spotify-green-dark transition-colors duration-200 ml-1 underline"
            >
              antoine@soch.at
            </a>
            .
          </p>
          <p>You can check out the 
            <a 
              href="/privacy-policy"
              className="hover:text-spotify-green-dark transition-colors duration-200 ml-1 underline"
            > 
              Privacy Policy
            </a> and the 
            <a 
              href="/terms-of-use"
              className="hover:text-spotify-green-dark transition-colors duration-200 ml-1 underline"
            > 
              Terms of Use
            </a>
            .
          </p>
        </div>
      </footer>
    );
  };
        
export default Footer;