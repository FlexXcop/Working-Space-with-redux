import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit'; 
import { formatRupiah } from '../../utils/formatters';

import {
  selectReservationById,
  selectRoomById,
  updateReservation,
  deleteReservation,
  approveReservation,
  rejectReservation,
  hasBookingConflict, 
} from '../../features/rooms/roomsSlice';
import { addNotification } from '../../features/tasks/tasksSlice';

const ReservationDetail = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const parsedReservationId = parseInt(reservationId);
  const reservation = useSelector((state) => selectReservationById(state, parsedReservationId));
  const { user, role } = useSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  const { reservations } = useSelector((state) => state.rooms);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // jika reservasi tidak ditemukan, tampilkan pesan
  if (!reservation) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Reservasi Tidak Ditemukan</h2>
          <p className="mt-2 text-gray-600">Reservasi yang Anda cari tidak ada atau telah dihapus.</p>
          <button
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            onClick={() => navigate('/rooms/reservations')}
          >
            Kembali ke Daftar Reservasi
          </button>
        </div>
      </div>
    );
  }

  // Ambil informasi ruangan terkait
  const room = useSelector((state) => selectRoomById(state, reservation.roomId));

  // helper 
  const formatDateTime = (dateTimeString) => new Date(dateTimeString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateDuration = (start, end) => {
    const durationMs = new Date(end) - new Date(start);
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours} jam ${minutes > 0 ? `${minutes} menit` : ''}`;
  };
  
  const handleApprove = async () => {
    setActionInProgress(true);
    try {
      const resultAction = await dispatch(approveReservation(parsedReservationId));
      unwrapResult(resultAction);
      alert('Reservasi berhasil disetujui!');
      dispatch(addNotification({ userId: reservation.userId, title: 'Reservasi Disetujui', message: `Reservasi Anda untuk ruangan "${room?.name || ''}" telah disetujui.`, type: 'reservation', relatedId: reservation.id }));
    } catch (err) {
      alert(`Gagal menyetujui: ${err}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = () => {
    dispatch(rejectReservation(parsedReservationId));
    alert('Reservasi telah ditolak.');
    dispatch(addNotification({ userId: reservation.userId, title: 'Reservasi Ditolak', message: `Reservasi Anda untuk ruangan "${room?.name || ''}" telah ditolak.`, type: 'reservation', relatedId: reservation.id }));
  };

  const handleDelete = () => {
    dispatch(deleteReservation(parsedReservationId));
    alert('Reservasi berhasil dibatalkan.');
    navigate('/rooms/reservations');
  };
  
  const handleExtend = () => {
    const extendHours = parseInt(prompt("Berapa jam ingin Anda perpanjang?", "1"), 10);
    if (isNaN(extendHours) || extendHours <= 0) {
      alert("Harap masukkan jumlah jam yang valid.");
      return;
    }

    const oldEndTime = new Date(reservation.endTime);
    const newEndTime = new Date(oldEndTime.getTime() + extendHours * 60 * 60 * 1000);
    
    // ngecek konflik dengan memanggil fungsi dari slice
    const conflict = hasBookingConflict(
      { rooms: { reservations } },
      {
        ...reservation, 
        startTime: reservation.endTime, 
        endTime: newEndTime.toISOString(), 
        id: reservation.id 
      }
    );

    if (conflict) {
      alert('Gagal memperpanjang: Waktu tambahan yang Anda pilih bentrok dengan reservasi lain.');
      return;
    }

    dispatch(updateReservation({
      id: reservation.id,
      endTime: newEndTime.toISOString()
    }));
    alert(`Reservasi berhasil diperpanjang selama ${extendHours} jam!`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-blue-700 text-white p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">{reservation.title}</h1>
            <p className="text-blue-100">{room?.name || 'Unknown Room'}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(reservation.status)}`}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Detail Reservasi</h2>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm font-medium text-gray-500">Waktu Mulai</p><p className="text-gray-800">{formatDateTime(reservation.startTime)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Waktu Selesai</p><p className="text-gray-800">{formatDateTime(reservation.endTime)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Durasi</p><p className="text-gray-800">{calculateDuration(reservation.startTime, reservation.endTime)}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Peserta</p><p className="text-gray-800">{reservation.attendees} orang</p></div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Catatan</h2>
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-gray-800">{reservation.notes || 'Tidak ada catatan tambahan.'}</p></div>
            </div>

            {/* tombol aksi buat admin & user */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Aksi</h2>
              <div className="flex space-x-3">
                {isAdmin && reservation.status === 'pending' && (
                  <>
                    <button onClick={handleApprove} disabled={actionInProgress} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Approve</button>
                    <button onClick={handleReject} disabled={actionInProgress} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50">Reject</button>
                  </>
                )}
                {reservation.status === 'confirmed' && (
                   <button onClick={handleExtend} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Perpanjang Reservasi</button>
                )}
                <button onClick={() => setShowConfirmDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Batalkan Reservasi</button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">Informasi Ruangan</h2>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {room && (
                <>
                  <img src={room.image} alt={room.name} className="w-full h-32 object-cover"/>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{room.type} • Lantai {room.floor}</p>
                    <p className="text-sm text-gray-500">Kapasitas: {room.capacity} orang</p>
                    <p className="text-sm text-gray-500">Tarif: {formatRupiah(room.hourlyRate)}/jam</p>
                    {/* <p className="text-sm text-gray-500">Tarif: ${room.hourlyRate}/jam</p> */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer / Back Button */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-200">
        <button onClick={() => navigate('/rooms/reservations')} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
          Kembali ke Daftar Reservasi
        </button>
      </div>

      {/* Modal Konfirmasi Pembatalan */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Konfirmasi Pembatalan</h3>
            <p className="text-gray-600 mb-4">Apakah Anda yakin ingin membatalkan reservasi ini? Tindakan ini tidak dapat diurungkan.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowConfirmDelete(false)} className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-50">Jangan Batalkan</button>
              <button onClick={handleDelete} className="px-4 py-2 border-transparent rounded-md text-white bg-red-600 hover:bg-red-700">Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetail;