import { useAuth } from "@getmocha/users-service/react";
import { Link, useLocation } from "react-router";
import { Heart, Building2, LogOut, User, Search } from "lucide-react";

export default function Navigation() {
  const { user, logout, redirectToLogin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getNavItemClasses = (path: string) => {
    const baseClasses = "relative px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 group";
    if (isActive(path)) {
      if (path === "/donate") {
        return `${baseClasses} bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105`;
      } else if (path === "/hospital") {
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105`;
      } else {
        return `${baseClasses} bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105`;
      }
    }
    return `${baseClasses} text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:backdrop-blur-sm hover:shadow-lg transform hover:scale-105`;
  };

  return (
    <nav className="glass-morphism border-b border-white/20 sticky top-0 z-50 animate-slideInDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-30 pulse-ring"></div>
            </div>
            <div>
              <span className="text-2xl font-bold gradient-text group-hover:scale-110 transform transition-transform">
                VitalFlow
              </span>
              <p className="text-xs text-gray-500 font-medium -mt-1">Blood Bank Network</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={getNavItemClasses("/")}>
              <Search className="w-4 h-4" />
              <span>Find Blood</span>
              {isActive("/") && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
              )}
            </Link>
            
            <Link to="/donate" className={getNavItemClasses("/donate")}>
              <Heart className="w-4 h-4" />
              <span>Donate Blood</span>
              {isActive("/donate") && (
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
              )}
            </Link>

            {user && (
              <Link to="/hospital" className={getNavItemClasses("/hospital")}>
                <Building2 className="w-4 h-4" />
                <span>Hospital Portal</span>
                {isActive("/hospital") && (
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                )}
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 glass-morphism-dark px-4 py-2 rounded-2xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">Hospital Admin</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 px-4 py-2 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 group"
                >
                  <LogOut className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  <span className="hidden sm:inline text-gray-700 group-hover:text-gray-900">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={redirectToLogin}
                className="btn-enhanced bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover-glow flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login with Google</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-2xl bg-white/80 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <Link to="/" className={getNavItemClasses("/")}>
              <Search className="w-4 h-4" />
              <span>Find Blood</span>
            </Link>
            
            <Link to="/donate" className={getNavItemClasses("/donate")}>
              <Heart className="w-4 h-4" />
              <span>Donate Blood</span>
            </Link>

            {user && (
              <Link to="/hospital" className={getNavItemClasses("/hospital")}>
                <Building2 className="w-4 h-4" />
                <span>Hospital Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 opacity-60"></div>
    </nav>
  );
}
