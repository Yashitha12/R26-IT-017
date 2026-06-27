import { ArrowLeft, User, MapPin, Phone, Mail, Home, Briefcase } from 'lucide-react';

export default function ProfileView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-gray-800">My Profile</h2>
      </div>

      <div className="p-4">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white mb-6 text-center shadow-xl shadow-purple-900/20">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
            <User className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-1">Nimal Perera</h3>
          <p className="text-blue-100 text-base">NIC: 198723456789</p>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="font-semibold text-gray-800">+94 77 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-800">nimal.perera@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">GN Division</p>
                <p className="font-semibold text-gray-800">Homagama - Division 542/A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Family Details */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Family Details</h3>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Family Size</p><p className="font-bold text-gray-800">4 Members</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Dependents</p><p className="font-bold text-gray-800">2 Children</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Spouse</p><p className="font-bold text-gray-800">Married</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Elderly</p><p className="font-bold text-gray-800">None</p></div>
          </div>
        </div>

        {/* Employment */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Employment & Income</h3>
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Occupation</p>
              <p className="font-semibold text-gray-800">Farmer</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Monthly Income</p><p className="font-bold text-green-600">Rs. 45,000</p></div>
            <div className="bg-orange-50 rounded-xl p-3"><p className="text-xs text-gray-500 mb-1">Monthly Expenses</p><p className="font-bold text-orange-600">Rs. 38,000</p></div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="font-bold text-green-900">Profile Verified</p>
          </div>
          <p className="text-sm text-green-700">KYC completed • GN verified • Smart ID active</p>
        </div>
      </div>
    </div>
  );
}