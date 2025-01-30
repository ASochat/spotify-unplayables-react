import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
      <nav className="w-full border-b border-gray-200 bg-body-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center justify-center flex-1">
              <div className="flex space-x-8">
                <Link 
                  to="/" 
                  className="text-body-color hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Your unplayables
                </Link>
                <Link 
                  to="/insights" 
                  className="text-body-color hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Insights on your songs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }


export default Navigation;