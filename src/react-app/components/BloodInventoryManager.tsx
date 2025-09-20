import { useState, useEffect } from "react";
import { Droplets, Save, AlertCircle, CheckCircle, Plus, Minus, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { BLOOD_TYPES } from "@/shared/types";

interface BloodInventoryManagerProps {
  hospitalId: number;
}

export default function BloodInventoryManager({ hospitalId }: BloodInventoryManagerProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/hospitals/${hospitalId}/inventory`);
        if (response.ok) {
          const data = await response.json();
          setInventory(data);
        } else {
          setError("Failed to load inventory");
        }
      } catch (error) {
        setError("Failed to load inventory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [hospitalId]);

  const updateUnits = (bloodType: string, units: number, animate = true) => {
    if (animate) {
      setAnimatingItems(prev => new Set(prev).add(bloodType));
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(bloodType);
          return newSet;
        });
      }, 300);
    }

    setInventory(prev => prev.map(item => 
      item.blood_type === bloodType 
        ? { ...item, units_available: Math.max(0, units) }
        : item
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/inventory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventory.map(item => ({
          blood_type: item.blood_type,
          units_available: item.units_available
        })))
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory");
      }

      setSaveMessage("Inventory updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setError("Failed to update inventory");
    } finally {
      setIsSaving(false);
    }
  };

  const getStockStatus = (units: number) => {
    if (units === 0) return { status: 'Out of Stock', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
    if (units < 5) return { status: 'Low Stock', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
    if (units < 10) return { status: 'Medium Stock', color: 'yellow', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
    return { status: 'In Stock', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
  };

  const getTotalUnits = () => inventory.reduce((total, item) => total + item.units_available, 0);
  const getLowStockCount = () => inventory.filter(item => item.units_available < 5 && item.units_available > 0).length;
  const getOutOfStockCount = () => inventory.filter(item => item.units_available === 0).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
            <div className="absolute inset-0 rounded-full border-2 border-red-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-pulse h-64 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-morphism rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-3xl font-bold gradient-text">{getTotalUnits()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-orange-600">{getLowStockCount()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{getOutOfStockCount()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-6 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blood Types</p>
              <p className="text-3xl font-bold text-green-600">{BLOOD_TYPES.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Blood Inventory Management</h2>
          <p className="text-gray-600 mt-2">Manage your hospital's blood inventory in real-time</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-enhanced bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:cursor-not-allowed hover-glow flex items-center space-x-3"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Success/Error Messages */}
      {saveMessage && (
        <div className="flex items-center space-x-3 text-green-600 bg-green-50 border border-green-200 p-4 rounded-2xl animate-slideInDown notification-slide">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 text-red-600 bg-red-50 border border-red-200 p-4 rounded-2xl animate-slideInDown notification-slide">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Blood Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {BLOOD_TYPES.map((bloodType, index) => {
          const inventoryItem = inventory.find(item => item.blood_type === bloodType);
          const units = inventoryItem?.units_available || 0;
          const stockInfo = getStockStatus(units);
          const isAnimating = animatingItems.has(bloodType);
          
          return (
            <div 
              key={bloodType} 
              className={`glass-morphism rounded-3xl shadow-xl p-8 hover-lift interactive-card transition-all duration-500 ${isAnimating ? 'animate-scaleIn' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Blood Type Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center transform transition-transform hover:scale-110">
                      <Droplets className="w-7 h-7 text-white" />
                    </div>
                    {units === 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{bloodType}</h3>
                    <p className="text-sm text-gray-600 font-medium">Blood Type</p>
                  </div>
                </div>
              </div>

              {/* Units Display */}
              <div className="text-center mb-6">
                <div className="relative">
                  <p className="text-5xl font-bold text-gray-800 mb-2 transition-all duration-300">{units}</p>
                  <p className="text-sm text-gray-600 font-medium">Units Available</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => updateUnits(bloodType, units + 1)}
                  className="bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>1</span>
                </button>
                <button
                  onClick={() => updateUnits(bloodType, units + 5)}
                  className="bg-green-100 hover:bg-green-200 text-green-700 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>5</span>
                </button>
                <button
                  onClick={() => updateUnits(bloodType, Math.max(0, units - 1))}
                  className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-1"
                >
                  <Minus className="w-4 h-4" />
                  <span>1</span>
                </button>
              </div>

              {/* Manual Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Set Units Manually
                </label>
                <input
                  type="number"
                  min="0"
                  value={units}
                  onChange={(e) => updateUnits(bloodType, parseInt(e.target.value) || 0, false)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-semibold text-center text-lg"
                  placeholder="0"
                />
              </div>

              {/* Status Badge */}
              <div className={`text-center py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-300 ${stockInfo.bgColor} ${stockInfo.textColor} ${stockInfo.borderColor}`}>
                <div className="flex items-center justify-center space-x-2">
                  {units === 0 ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : units < 5 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>{stockInfo.status}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      units === 0 ? 'bg-red-500' : 
                      units < 5 ? 'bg-orange-500' : 
                      units < 10 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (units / 20) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {units}/20+ units (recommended minimum: 5)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidelines Section */}
      <div className="glass-morphism rounded-3xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-800">Inventory Management Guidelines</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <ul className="space-y-3 text-blue-700">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Update inventory in real-time for accurate availability</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Maintain minimum 5 units per blood type when possible</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Priority restocking for O-, AB+, and rare blood types</span>
            </li>
          </ul>
          <ul className="space-y-3 text-blue-700">
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Save changes frequently to prevent data loss</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Monitor low stock alerts and plan accordingly</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Coordinate with blood banks for emergency restocking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
