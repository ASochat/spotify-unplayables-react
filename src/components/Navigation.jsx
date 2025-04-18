import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="w-full">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-36">
          <div className="flex space-x-4 sm:space-x-12 w-full max-w-5xl">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex-1 px-4 sm:px-6 py-2 rounded-full text-sm font-medium uppercase transition-all duration-200 border-2 text-center
                ${isActive 
                  ? 'bg-black text-white border-black' 
                  : 'text-black hover:bg-gray-350 border-black'
                }`
              }
            >
              Your unplayables
            </NavLink>
            <NavLink 
              to="/insights" 
              className={({ isActive }) => 
                `flex-1 px-4 sm:px-6 py-2 rounded-full text-sm font-medium uppercase transition-all duration-200 border-2 text-center
                ${isActive 
                  ? 'bg-black text-white border-black' 
                  : 'text-black hover:bg-gray-350 border-black'
                }`
              }
            >
              Insights on your music taste
            </NavLink>
            <NavLink 
              to="/playlists" 
              className={({ isActive }) => 
                `flex-1 px-4 sm:px-6 py-2 rounded-full text-sm font-medium uppercase transition-all duration-200 border-2 text-center
                ${isActive 
                  ? 'bg-black text-white border-black' 
                  : 'text-black hover:bg-gray-350 border-black'
                }`
              }
            >
              Your Playlists
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;