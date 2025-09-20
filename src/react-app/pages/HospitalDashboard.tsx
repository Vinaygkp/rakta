import { useState, useEffect } from "react";
import { useAuth } from "@getmocha/users-service/react";
import { Building2, Droplets, Users, AlertCircle, Heart } from "lucide-react";
import HospitalRegistration from "@/react-app/components/HospitalRegistration";
import BloodInventoryManager from "@/react-app/components/BloodInventoryManager";
import BloodRequestsList from "@/react-app/components/BloodRequestsList";
import BloodDonationManager from "@/react-app/components/BloodDonationManager";

export default function HospitalDashboard() {
  const { user, isPending } = useAuth();
  const [hospital, setHospital] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'donations'>('inventory');

  useEffect(() => {
    if (!user || isPending) return;

    const fetchHospital = async () => {
      try {
        const response = await fetch("/api/hospitals/my");
        if (response.ok) {
          const hospitals = await response.json();
          setHospital(hospitals[0] || null);
        }
      } catch (error) {
        console.error("Failed to fetch hospital:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospital();
  }, [user, isPending]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
        <p className="text-gray-600">Please log in to access the hospital dashboard.</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hospital Registration</h1>
          <p className="text-gray-600">Register your hospital to start managing blood inventory and requests.</p>
        </div>
        <HospitalRegistration onRegistered={setHospital} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{hospital.name}</h1>
            <p className="text-gray-600">{hospital.city}, {hospital.state}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'inventory'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4" />
              <span>Blood Inventory</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Blood Requests</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'donations'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Add Blood</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <BloodInventoryManager hospitalId={hospital.id} />
      )}
      
      {activeTab === 'requests' && (
        <BloodRequestsList hospitalId={hospital.id} />
      )}
      
      {activeTab === 'donations' && (
        <BloodDonationManager hospitalId={hospital.id} />
      )}
    </div>
  );
}
