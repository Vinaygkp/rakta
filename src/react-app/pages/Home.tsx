import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Navigation, Clock, Droplets } from "lucide-react";
import { BLOOD_TYPES } from "@/shared/types";
import BloodSearchResults from "@/react-app/components/BloodSearchResults";
import BloodRequestModal from "@/react-app/components/BloodRequestModal";

export default function Home() {
  const [selectedBloodType, setSelectedBloodType] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [hospitalName, setHospitalName] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Fetch available districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch("/api/districts");
        if (response.ok) {
          const districts = await response.json();
          setAvailableDistricts(districts);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLocationLoading(false);
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setIsLocationLoading(false);
          resolve(coords);
        },
        (error) => {
          setIsLocationLoading(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  const handleSearch = async () => {
    if (!selectedBloodType) return;

    setIsSearching(true);
    try {
      let searchUrl = `/api/search?blood_type=${selectedBloodType}`;
      
      // Add district filter if selected
      if (selectedDistrict) {
        searchUrl += `&district=${encodeURIComponent(selectedDistrict)}`;
      }
      
      // Add hospital name filter if provided
      if (hospitalName.trim()) {
        searchUrl += `&hospital_name=${encodeURIComponent(hospitalName.trim())}`;
      }
      
      // Try to get location for better results (only if no district or hospital name is selected)
      if (!selectedDistrict && !hospitalName.trim()) {
        try {
          const location = userLocation || await getCurrentLocation();
          searchUrl += `&lat=${location.lat}&lng=${location.lng}&radius=50`;
        } catch (error) {
          console.log("Location not available, searching without location filter");
        }
      }

      const response = await fetch(searchUrl);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(Array.isArray(results) ? results : []);
      } else {
        console.error("Search API error:", response.status, response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestBlood = (hospital: any) => {
    setSelectedHospital(hospital);
    setShowRequestModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-slideInUp">
        <div className="relative mb-8">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6 animate-slideInDown">
            Find Blood When It Matters Most
          </h1>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full animate-bounce opacity-20"></div>
          <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-rose-400 rounded-full animate-pulse opacity-30"></div>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed animate-slideInUp" style={{animationDelay: '0.2s'}}>
          Connect with hospitals and blood banks in your area. Search for available blood types and make requests instantly.
        </p>
        
        <div className="flex items-center justify-center space-x-3 text-sm text-green-600 glass-morphism border border-green-200 rounded-2xl px-6 py-3 max-w-md mx-auto animate-slideInUp" style={{animationDelay: '0.4s'}}>
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-semibold">Real-time data from hospital portals</span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-slideInUp" style={{animationDelay: '0.6s'}}>
          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Instant Search</h3>
            <p className="text-gray-600 text-sm">Find blood instantly across multiple hospitals</p>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Location Based</h3>
            <p className="text-gray-600 text-sm">Find the nearest available blood sources</p>
          </div>
          
          <div className="glass-morphism rounded-2xl p-6 hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">24/7 Available</h3>
            <p className="text-gray-600 text-sm">Emergency blood requests anytime</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-morphism rounded-3xl shadow-2xl border border-red-100 p-10 mb-12 animate-slideInUp" style={{animationDelay: '0.8s'}}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-3">
            Search for Blood Availability
          </h2>
          <p className="text-gray-600">Find the blood type you need from nearby hospitals and blood banks</p>
        </div>
        
        <div className="space-y-6">
          {/* Blood Type Selection */}
          <div className="animate-slideInLeft">
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-red-500" />
              <span>Select Blood Type *</span>
            </label>
            <div className="relative">
              <select
                value={selectedBloodType}
                onChange={(e) => setSelectedBloodType(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus-ring bg-white/80 backdrop-blur-sm font-semibold text-lg appearance-none hover:border-red-300 transition-all duration-300"
              >
                <option value="">Choose blood type...</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type} Blood Type
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Method Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Choose Search Method</h3>
            
            {/* District Search */}
            <div className="glass-morphism bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 hover-lift animate-slideInUp" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-blue-800 text-lg">Search by District</span>
                </div>
                {selectedDistrict && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-blue-300 focus-ring-green bg-white/80 backdrop-blur-sm font-medium appearance-none transition-all duration-300"
              >
                <option value="">Select a district...</option>
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <p className="text-sm text-blue-700 mt-3 font-medium">
                Find hospitals within a specific district for targeted search
              </p>
            </div>

            {/* Hospital Name Search */}
            <div className="glass-morphism bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 hover-lift animate-slideInUp" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-purple-800 text-lg">Search by Hospital Name</span>
                </div>
                {hospitalName.trim() && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Enter hospital name..."
                className="w-full px-4 py-4 rounded-2xl border border-purple-300 focus-ring bg-white/80 backdrop-blur-sm font-medium transition-all duration-300"
              />
              <p className="text-sm text-purple-700 mt-3 font-medium">
                Search for hospitals by name - supports partial matches
              </p>
            </div>

            {/* Location Search */}
            <div className="glass-morphism bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover-lift animate-slideInUp" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-green-800 text-lg">Search by Location</span>
                  {userLocation && !selectedDistrict && !hospitalName.trim() && (
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={getCurrentLocation}
                  disabled={!!selectedDistrict || !!hospitalName.trim() || isLocationLoading}
                  className="flex items-center space-x-2 px-4 py-3 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-2xl transition-all duration-300 text-sm font-semibold transform hover:scale-105 disabled:transform-none"
                  title={selectedDistrict || hospitalName.trim() ? "Location search disabled when district or hospital name is selected" : "Get current location for better results"}
                >
                  {isLocationLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{isLocationLoading ? "Getting Location..." : "Use My Location"}</span>
                </button>
              </div>
              <p className="text-sm text-green-700 font-medium">
                {selectedDistrict || hospitalName.trim()
                  ? "Location search is disabled when district or hospital name is selected" 
                  : userLocation 
                    ? "✓ Location detected - will show nearest hospitals" 
                    : "Click 'Use My Location' to find hospitals near you"
                }
              </p>
            </div>
          </div>

          

            {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={!selectedBloodType || isSearching}
            className="w-full btn-enhanced bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-6 rounded-3xl font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:cursor-not-allowed text-xl hover-glow transform hover:scale-105 disabled:transform-none animate-slideInUp flex items-center justify-center space-x-3"
            style={{animationDelay: '0.5s'}}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-white"></div>
                <span>Searching Hospitals...</span>
              </>
            ) : (
              <>
                <Search className="w-8 h-8" />
                <span>
                  {hospitalName.trim()
                    ? `Search "${hospitalName.trim()}"` 
                    : selectedDistrict 
                      ? `Search in ${selectedDistrict}` 
                      : userLocation 
                        ? "Search Near Me" 
                        : "Search Blood Banks"
                  }
                </span>
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </>
            )}
          </button>
          </div>

        {/* Search Status */}
        <div className="mt-8 space-y-3 animate-slideInUp" style={{animationDelay: '0.6s'}}>
          {hospitalName.trim() && (
            <div className="flex items-center justify-center space-x-3 text-sm glass-morphism border border-purple-200 rounded-2xl px-6 py-3 notification-slide">
              <Search className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-bold">Hospital Search: "{hospitalName.trim()}"</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {selectedDistrict && !hospitalName.trim() && (
            <div className="flex items-center justify-center space-x-3 text-sm glass-morphism border border-blue-200 rounded-2xl px-6 py-3 notification-slide">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-bold">District Search: {selectedDistrict}</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {userLocation && !selectedDistrict && !hospitalName.trim() && (
            <div className="flex items-center justify-center space-x-3 text-sm glass-morphism border border-green-200 rounded-2xl px-6 py-3 notification-slide">
              <Navigation className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-bold">Location Search Active - Showing Nearest Results</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {!selectedDistrict && !userLocation && !hospitalName.trim() && (
            <div className="flex items-center justify-center space-x-3 text-sm glass-morphism border border-gray-200 rounded-2xl px-6 py-3">
              <Search className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Select search method for better results</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <BloodSearchResults 
        results={searchResults}
        onRequestBlood={handleRequestBlood}
        selectedBloodType={selectedBloodType}
      />

      {/* Request Modal */}
      {showRequestModal && selectedHospital && (
        <BloodRequestModal
          hospital={selectedHospital}
          bloodType={selectedBloodType}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedHospital(null);
          }}
        />
      )}

      {/* Info Section */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 animate-fadeIn">
        <div className="text-center p-8 glass-morphism rounded-3xl hover-lift interactive-card">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl flex items-center justify-center mx-auto transform transition-transform hover:scale-110">
              <Search className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl opacity-0 hover:opacity-20 pulse-ring"></div>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Lightning Fast Search</h3>
          <p className="text-gray-700 leading-relaxed">
            Find available blood types at hospitals near you in real-time with our advanced search algorithm.
          </p>
        </div>

        <div className="text-center p-8 glass-morphism rounded-3xl hover-lift interactive-card">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto transform transition-transform hover:scale-110">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-0 hover:opacity-20 pulse-ring"></div>
          </div>
          <h3 className="text-2xl font-bold text-blue-600 mb-4">Real-time Updates</h3>
          <p className="text-gray-700 leading-relaxed">
            Get up-to-date information on blood availability and make instant requests with live inventory tracking.
          </p>
        </div>

        <div className="text-center p-8 glass-morphism rounded-3xl hover-lift interactive-card">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto transform transition-transform hover:scale-110">
              <Phone className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl opacity-0 hover:opacity-20 pulse-ring"></div>
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-4">Direct Connect</h3>
          <p className="text-gray-700 leading-relaxed">
            Connect directly with hospitals and blood banks for urgent requests through secure communication channels.
          </p>
        </div>
      </div>
    </div>
  );
}
