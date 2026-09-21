import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { getMe } from '../api/auth';
import { logError } from '../utils/logger';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldHalved,
  FaCalendarDays,
  FaRotate,
  FaCube,
  FaBagShopping,
  FaClock,
} from 'react-icons/fa6';

const Account = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total_orders: 0,
    items_purchased: 0,
    active_orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getMe();
      setProfile(response.data);
      setStats({
        total_orders: response.data.total_orders ?? 0,
        items_purchased: response.data.items_purchased ?? 0,
        active_orders: response.data.active_orders ?? 0,
      });
      updateUser({ ...response.data });
    } catch (error) {
      logError('Failed to fetch profile:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayUser = profile || user;

  const memberSince = displayUser?.created_at
    ? new Date(displayUser.created_at)
    : null;

  return (
    <div className="min-h-screen bg-warm py-3 px-3 md:py-4">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-3">
            <FaUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">My Profile</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Manage your profile</p>
          <button
            onClick={fetchProfile}
            className="mt-3 inline-flex items-center gap-2 text-terra hover:text-terra-dark text-sm font-bold"
            type="button"
          >
            <FaRotate className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {hasError && (
          <div className="bg-red-50 border-4 border-red-600 shadow-hard-sm p-4 mb-6 text-center">
            <p className="font-bold text-red-700">
              Could not load your profile. Check your connection and try again.
            </p>
          </div>
        )}

        {!hasError && (
          <>
          <div className="bg-white border-4 border-black shadow-hard-sm p-4 md:p-6 mb-6 max-w-3xl mx-auto">
            <h2 className="font-h text-xl font-bold text-black uppercase mb-4 flex items-center">
              <FaUser className="mr-2 text-terra" />
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
                <FaUser className="w-5 h-5 text-terra" />
                <div className="min-w-0">
                  <p className="text-xs text-ash uppercase tracking-wider">Full Name</p>
                  <p className="font-h font-bold text-black truncate">{displayUser?.name || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
                <FaEnvelope className="w-5 h-5 text-terra" />
                <div className="min-w-0">
                  <p className="text-xs text-ash uppercase tracking-wider">Email Address</p>
                  <p className="font-h font-bold text-black truncate">{displayUser?.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
                <FaPhone className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash uppercase tracking-wider">Phone Number</p>
                  <p className="font-h font-bold text-black">{displayUser?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-terra/5 border-2 border-terra">
                <FaShieldHalved className="w-5 h-5 text-terra" />
                <div>
                  <p className="text-xs text-ash uppercase tracking-wider">Account Status</p>
                  <p className="font-h font-bold text-green-600">
                    {isLoading ? '...' : displayUser?.is_admin ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-ash flex items-center justify-center space-x-1">
                <FaCalendarDays className="w-3 h-3" />
                <span>
                  Member since {memberSince ? memberSince.toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : '—'}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
              <FaCube className="w-8 h-8 text-terra mx-auto mb-2" />
              <p className="font-h text-2xl font-bold text-black">{isLoading ? '—' : stats.total_orders}</p>
              <p className="text-xs text-ash uppercase tracking-wider">Total Orders</p>
            </div>
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
              <FaBagShopping className="w-8 h-8 text-terra mx-auto mb-2" />
              <p className="font-h text-2xl font-bold text-black">{isLoading ? '—' : stats.items_purchased}</p>
              <p className="text-xs text-ash uppercase tracking-wider">Items Purchased</p>
            </div>
            <div className="bg-white border-4 border-black shadow-hard-sm p-4 text-center hover:-translate-y-1 transition-all">
              <FaClock className="w-8 h-8 text-terra mx-auto mb-2" />
              <p className="font-h text-2xl font-bold text-black">{isLoading ? '—' : stats.active_orders}</p>
              <p className="text-xs text-ash uppercase tracking-wider">Active Orders</p>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Account;