import { useState, useEffect } from "react";
import { Users, Phone, Mail, Calendar, AlertCircle, CheckCircle, Clock, Droplets } from "lucide-react";

interface BloodRequestsListProps {
  hospitalId: number;
}

export default function BloodRequestsList({ hospitalId }: BloodRequestsListProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [hospitalId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/requests`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setError("Failed to load requests");
      }
    } catch (error) {
      setError("Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, status: string) => {
    setUpdatingStatus(requestId);
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status } : req
        ));
      } else {
        setError("Failed to update request status");
      }
    } catch (error) {
      setError("Failed to update request status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-2xl font-semibold text-gray-800">Blood Requests</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{requests.length} total requests</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Blood Requests</h3>
          <p className="text-gray-600">Blood requests from patients will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-red-100 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{request.requester_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Droplets className="w-4 h-4 mr-1" />
                              {request.blood_type} • {request.units_needed} unit{request.units_needed !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{request.requester_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{request.requester_email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Requested: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{request.notes}</p>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => updateRequestStatus(request.id, 'approved')}
                      disabled={updatingStatus === request.id}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'cancelled')}
                      disabled={updatingStatus === request.id}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                      disabled={updatingStatus === request.id}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Fulfilled</span>
                    </button>
                  </div>
                )}

                <div className="flex gap-2 mt-4 lg:mt-0 lg:ml-6">
                  <a
                    href={`tel:${request.requester_phone}`}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${request.requester_email}`}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Request Management Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Review each request carefully before approving</li>
          <li>• Contact the requester to verify availability before approval</li>
          <li>• Mark requests as fulfilled only after blood is delivered</li>
          <li>• Use phone/email contact for urgent communications</li>
        </ul>
      </div>
    </div>
  );
}
