import { useState } from "react";
import { X, Droplets, AlertCircle, CheckCircle, User, Phone, Mail, Hash, AlertTriangle, FileText } from "lucide-react";
import { REQUEST_URGENCY } from "@/shared/types";

interface BloodRequestModalProps {
  hospital: any;
  bloodType: string;
  onClose: () => void;
}

export default function BloodRequestModal({ hospital, bloodType, onClose }: BloodRequestModalProps) {
  const [formData, setFormData] = useState({
    requester_name: "",
    requester_phone: "",
    requester_email: "",
    units_needed: 1,
    urgency: "medium" as typeof REQUEST_URGENCY[number],
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          blood_type: bloodType,
          hospital_id: hospital.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit request");
      }

      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="glass-morphism rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce-gentle">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full pulse-ring"></div>
            </div>
            <h2 className="text-3xl font-bold gradient-text-green mb-3">Request Submitted!</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Your blood request has been sent to <span className="font-semibold text-red-600">{hospital.name}</span>. 
              They will contact you shortly to confirm availability and coordinate next steps.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Hospital will verify blood availability</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>You'll receive a call within 30 minutes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Collection details will be coordinated</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={onClose}
              className="w-full btn-enhanced bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 hover-glow-green"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-morphism rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideInUp">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center">
                  <Droplets className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">Request Blood</h2>
                <p className="text-gray-600 font-medium">{hospital.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-red-50 rounded-2xl transition-colors group"
            >
              <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <Droplets className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">Requesting Blood Type</p>
                  <p className="text-2xl font-bold text-red-800">{bloodType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-600">Available Units</p>
                <p className="text-3xl font-bold text-red-800">{hospital.units_available}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.requester_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_name: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.requester_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_phone: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.requester_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, requester_email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Units Needed *
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max={hospital.units_available}
                    required
                    value={formData.units_needed}
                    onChange={(e) => setFormData(prev => ({ ...prev, units_needed: parseInt(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium"
                    placeholder="Number of units"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Urgency Level *
                </label>
                <div className="relative">
                  <AlertTriangle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium appearance-none"
                  >
                    <option value="low">Low - Routine</option>
                    <option value="medium">Medium - Scheduled</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - Emergency</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Additional Notes
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus-ring bg-white/70 backdrop-blur-sm font-medium resize-none"
                  placeholder="Any additional information or special requirements..."
                />
              </div>
            </div>

            {/* Urgency Preview */}
            <div className={`p-4 rounded-2xl border ${getUrgencyColor(formData.urgency)}`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">
                  {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority Request
                </span>
              </div>
              <p className="text-sm mt-1 opacity-80">
                {formData.urgency === 'critical' && 'Emergency request - Hospital will be contacted immediately'}
                {formData.urgency === 'high' && 'Urgent request - Response expected within 2 hours'}
                {formData.urgency === 'medium' && 'Standard request - Response expected within 24 hours'}
                {formData.urgency === 'low' && 'Routine request - Response expected within 48 hours'}
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-3 text-red-600 bg-red-50 border border-red-200 p-4 rounded-2xl animate-slideInLeft">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-enhanced bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:cursor-not-allowed hover-glow flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
