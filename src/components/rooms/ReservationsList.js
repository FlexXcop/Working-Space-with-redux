import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit'; 
import {
  selectAllReservations,
  selectAllRooms,
  approveReservation, 
  rejectReservation,
} from '../../features/rooms/roomsSlice';
import { addNotification } from '../../features/tasks/tasksSlice';

const ReservationsList = ({ userId = null, roomId = null, limit = null }) => {
  const dispatch = useDispatch();
  const allReservations = useSelector(selectAllReservations);
  const rooms = useSelector(selectAllRooms);
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin';

  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [actionInProgress, setActionInProgress] = useState(null);

  // filter and sort reservations
  let filteredReservations = [...allReservations];

  if (userId) {
    filteredReservations = filteredReservations.filter(res => res.userId === userId);
  }
  if (roomId) {
    filteredReservations = filteredReservations.filter(res => res.roomId === roomId);
  }
  if (filterStatus !== 'all') {
    filteredReservations = filteredReservations.filter(res => res.status === filterStatus);
  }

  // Sorting logic 
  filteredReservations.sort((a, b) => {
    let compareValueA, compareValueB;
    if (sortBy === 'date') {
      compareValueA = new Date(a.startTime).getTime();
      compareValueB = new Date(b.startTime).getTime();
    } else if (sortBy === 'room') {
      compareValueA = a.roomId;
      compareValueB = b.roomId;
    } else { // status or default
      compareValueA = a.status;
      compareValueB = b.status;
    }
    return sortOrder === 'asc' ? compareValueA - compareValueB : compareValueB - compareValueA;
  });

  if (limit && filteredReservations.length > limit) {
    filteredReservations = filteredReservations.slice(0, limit);
  }

  // Helper 
  const formatDateTime = (dateTimeString) => new Date(dateTimeString).toLocaleString();
  const getRoomInfo = (roomId) => rooms.find(r => r.id === roomId)?.name || 'Unknown Room';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

//  handleapprove
  const handleApprove = async (reservation) => {
    setActionInProgress(reservation.id);
    try {
      // 1. dispatch thunk dan tunggu hasilnya
      const resultAction = await dispatch(approveReservation(reservation.id));
      
      // 2. unwrapResult akan melempar error jika thunk gagal (ditolak karena konflik)
      unwrapResult(resultAction);

      // 3. jika berhasil, kirim notifikasi sukses ke pengguna
      dispatch(addNotification({
        userId: reservation.userId,
        title: 'Reservation Approved',
        message: `Your reservation for "${getRoomInfo(reservation.roomId)}" has been approved.`,
        type: 'reservation',
        relatedId: reservation.id,
      }));
      
      alert('Reservasi berhasil disetujui!');

    } catch (err) {
      console.error('Failed to approve reservation:', err);
      alert(`Error: ${err}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = (reservation) => {
    setActionInProgress(reservation.id);
    dispatch(rejectReservation(reservation.id));
    dispatch(addNotification({
      userId: reservation.userId,
      title: 'Reservation Rejected',
      message: `Your reservation for "${getRoomInfo(reservation.roomId)}" has been rejected.`,
      type: 'reservation',
      relatedId: reservation.id,
    }));
    setTimeout(() => setActionInProgress(null), 300); // Reset setelah beberapa saat
  };

  //  hasConflict dapat disederhanakan karena logika utama ada di slice
  const hasConflict = (reservation) => {
    if (reservation.status !== 'pending') return false;
    const confirmedReservations = allReservations.filter(r => r.roomId === reservation.roomId && r.status === 'confirmed');
    const newStartTime = new Date(reservation.startTime).getTime();
    const newEndTime = new Date(reservation.endTime).getTime();
    return confirmedReservations.some(r => {
      const existingStartTime = new Date(r.startTime).getTime();
      const existingEndTime = new Date(r.endTime).getTime();
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });
  };

  if (filteredReservations.length === 0 && !limit) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-900">No Reservations Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Filter and Sort Controls */}
      {!limit && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="filterStatus" className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select id="sortBy" className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="room">Room</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select id="sortOrder" className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      )}

      {/* Reservations List */}
      <ul className="divide-y divide-gray-200">
        {filteredReservations.map(reservation => {
          const conflict = hasConflict(reservation);
          return (
            <li key={reservation.id} className="hover:bg-gray-50">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <Link to={`/rooms/reservations/${reservation.id}`} className="text-sm font-medium text-blue-600 truncate hover:underline">
                    {reservation.title}
                  </Link>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {/* Room Icon */}
                      {getRoomInfo(reservation.roomId)}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {/* People Icon */}
                      {reservation.attendees} People
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    {/* Date Icon */}
                    <p>{formatDateTime(reservation.startTime)}</p>
                  </div>
                </div>
                
                {/* Admin Actions for Pending Reservations */}
                {isAdmin && reservation.status === 'pending' && (
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      {conflict && (
                        <div className="flex items-center text-red-500 text-xs" title="This reservation conflicts with another confirmed booking.">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Conflict</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleReject(reservation)} disabled={actionInProgress === reservation.id} className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                        Reject
                      </button>
                      <button onClick={() => handleApprove(reservation)} disabled={actionInProgress === reservation.id} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      
      {/* View All Link (if limited) */}
      {limit && filteredReservations.length >= limit && (
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Link to="/rooms/reservations" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View All Reservations
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReservationsList;