import { MapPin, Phone, Mail, Droplets, Calendar, Building2, Heart } from "lucide-react";

interface DonorSearchResultsProps {
  results: any[] | null | undefined;
  onContactHospital: (hospital: any) => void;
  selectedBloodType?: string;
}

export default function DonorSearchResults({ results, onContactHospital, selectedBloodType }: DonorSearchResultsProps) {
  // Ensure results is always an array
  const safeResults = Array.isArray(results) ? results : [];
  
  if (safeResults.length === 0 && selectedBloodType) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Donation Centers Found</h3>
        <p className="text-gray-600">
          No hospitals currently accepting {selectedBloodType} donations in your area.
        </p>
      </div>
    );
  }

  if (safeResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Donation Centers ({safeResults.length} found)
      </h2>
      
      <div className="grid gap-6">
        {safeResults.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-200 relative"
          >
            {/* Hospital Portal Badge */}
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Accepting Donations</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
                    </div>
                    {hospital.distance && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hospital.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                      <Heart className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        {selectedBloodType ? `${selectedBloodType} Needed` : 'Blood Donations Needed'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Last updated: {new Date(hospital.last_updated_at || hospital.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Blood Type Needs */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Blood Type Needs</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.blood_needs?.map((need: any) => (
                      <div
                        key={need.blood_type}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          need.priority === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : need.priority === 'high' 
                              ? 'bg-orange-100 text-orange-700'
                              : need.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <Droplets className="w-3 h-3" />
                        <span>{need.blood_type}</span>
                        <span>({need.units_available} units)</span>
                      </div>
                    )) || (
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Heart className="w-3 h-3" />
                        <span>All blood types welcome</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hospital Activity Indicators */}
                <div className="flex items-center space-x-4 mb-4 text-xs text-gray-600">
                  {hospital.recent_donations > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{hospital.recent_donations} donations this month</span>
                    </div>
                  )}
                  {hospital.recent_fulfillments > 0 && (
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{hospital.recent_fulfillments} requests fulfilled</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                    <Heart className="w-3 h-3 text-green-500" />
                    <span>Actively accepting donations</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {hospital.address}, {hospital.city}
                      {hospital.district && `, ${hospital.district}`}, {hospital.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{hospital.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{hospital.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Donation center with blood bank
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:ml-6">
                <a
                  href={`tel:${hospital.phone}`}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
                <button
                  onClick={() => onContactHospital(hospital)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200"
                >
                  <Heart className="w-4 h-4" />
                  <span>Schedule Donation</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
