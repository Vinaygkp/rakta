import { useState, useEffect } from "react";
import { Plus, Heart, User, Phone, Mail, Calendar, Droplets, Save, AlertCircle, CheckCircle } from "lucide-react";
import { BLOOD_TYPES } from "@/shared/types";

interface BloodDonationManagerProps {
  hospitalId: number;
}

interface DonationFormData {
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  blood_type: string;
  units_donated: number;
  donation_date: string;
  notes: string;
}

export default function BloodDonationManager({ hospitalId }: BloodDonationManagerProps) {
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<DonationFormData>({
    donor_name: "",
    donor_phone: "",
    donor_email: "",
    blood_type: "",
    units_donated: 1,
    donation_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchDonations();
  }, [hospitalId]);

  const fetchDonations = async () => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/donations`);
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      } else {
        setError("Failed to load donations");
      }
    } catch (error) {
      setError("Failed to load donations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          donor_email: formData.donor_email || undefined,
          notes: formData.notes || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record donation");
      }

      const newDonation = await response.json();
      setDonations(prev => [newDonation, ...prev]);
      setMessage("Blood donation recorded successfully!");
      setShowForm(false);
      setFormData({
        donor_name: "",
        donor_phone: "",
        donor_email: "",
        blood_type: "",
        units_donated: 1,
        donation_date: new Date().toISOString().split('T')[0],
        notes: ""
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      donor_name: "",
      donor_phone: "",
      donor_email: "",
      blood_type: "",
      units_donated: 1,
      donation_date: new Date().toISOString().split('T')[0],
      notes: ""
    });
    setShowForm(false);
    setError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Blood Donation Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Record Donation</span>
        </button>
      </div>

      {message && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Donation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Record Blood Donation</h3>
                    <p className="text-sm text-gray-600">Add a new blood donation to inventory</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Type *
                    </label>
                    <select
                      required
                      value={formData.blood_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select blood type</option>
                      {BLOOD_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units Donated *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.units_donated}
                      onChange={(e) => setFormData(prev => ({ ...prev, units_donated: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donation Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={formData.donation_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, donation_date: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Donor Information (Optional)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Donor Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <input
                          type="text"
                          value={formData.donor_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Full name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                          <input
                            type="tel"
                            value={formData.donor_phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, donor_phone: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                          <input
                            type="email"
                            value={formData.donor_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, donor_email: e.target.value }))}
                            className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Email address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Any additional notes about this donation..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? "Recording..." : "Record Donation"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Donations History */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-red-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donations</h3>
        
        {donations.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-800 mb-2">No Donations Yet</h4>
            <p className="text-gray-600">Blood donations will appear here when recorded.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{donation.blood_type}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{donation.units_donated} unit{donation.units_donated !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {donation.donor_name && (
                        <span>Donor: {donation.donor_name} • </span>
                      )}
                      Date: {new Date(donation.donation_date).toLocaleDateString()}
                    </div>
                    {donation.notes && (
                      <div className="text-sm text-gray-500 mt-1">{donation.notes}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(donation.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2">Blood Donation Guidelines</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Record donations immediately to keep inventory accurate</li>
          <li>• Donor information is optional but helpful for follow-up</li>
          <li>• All donations automatically update blood inventory</li>
          <li>• Verify blood type before recording donation</li>
        </ul>
      </div>
    </div>
  );
}
