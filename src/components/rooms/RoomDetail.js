import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatRupiah } from '../../utils/formatters'; 
import { selectRoomById, selectReservationsByRoom, deleteRoom } from '../../features/rooms/roomsSlice';

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const parsedRoomId = parseInt(roomId);
  const room = useSelector(state => selectRoomById(state, parsedRoomId));
  const reservations = useSelector(state => selectReservationsByRoom(state, parsedRoomId));
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin';
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  if (!room) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Room not found</h2>
          <p className="mt-2 text-gray-600">The room you're looking for doesn't exist or has been removed.</p>
          <button
            className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/rooms')}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }
  
  // Format amenities for display
  const formatAmenity = (amenity) => {
    return amenity
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle room deletion
  const handleDelete = () => {
    dispatch(deleteRoom(parsedRoomId));
    navigate('/rooms');
  };

  // WhatsApp booking function
  const handleWhatsAppBooking = () => {
    // Format information for WhatsApp
    const message = encodeURIComponent(`
I would like to book the following room:

*Room Name:* ${room.name}
*Room Type:* ${formatAmenity(room.type)}
*Capacity:* ${room.capacity} people
*Floor:* ${room.floor}
*Rate:* $${room.hourlyRate}/hour

Please confirm availability for my requested date and time. Thank you!
    `);
    
    // Open WhatsApp with prefilled message
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
      {/* Room Header with Image */}
      <div className="relative h-64 bg-gray-300">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold">{room.name}</h1>
            <p className="text-lg opacity-90">{formatAmenity(room.type)} • Floor {room.floor}</p>
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {room.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {formatRupiah(room.hourlyRate)}/jam
          </span>
          {/* <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            ${room.hourlyRate}/hour
          </span> */}
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Capacity: {room.capacity}
          </span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center" title="Kapasitas Parkir Mobil">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2zM5.22 3.22a.75.75 0 0 1 1.06 0L7.5 4.44a.75.75 0 1 1-1.06 1.06L5.22 4.28a.75.75 0 0 1 0-1.06zM2 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10zm12.78 4.28a.75.75 0 0 1 0 1.06l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22a.75.75 0 0 1 1.06 0zM10 18a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 10 18zM14.78 3.22a.75.75 0 0 1 1.06 0l1.22 1.22a.75.75 0 1 1-1.06 1.06L14.78 4.28a.75.75 0 0 1 0-1.06zM18 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 18 10zm-5.22 4.28a.75.75 0 0 1 0 1.06l-1.22 1.22a.75.75 0 0 1-1.06-1.06l1.22-1.22a.75.75 0 0 1 1.06 0z"></path></svg>
            {room.parkingCapacityCars} Mobil
          </span>
          <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium flex items-center" title="Kapasitas Parkir Motor">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2zM5.22 3.22a.75.75 0 0 1 1.06 0L7.5 4.44a.75.75 0 1 1-1.06 1.06L5.22 4.28a.75.75 0 0 1 0-1.06zM2 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10zm12.78 4.28a.75.75 0 0 1 0 1.06l-1.22 1.22a.75.75 0 1 1-1.06-1.06l1.22-1.22a.75.75 0 0 1 1.06 0zM10 18a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 10 18zM14.78 3.22a.75.75 0 0 1 1.06 0l1.22 1.22a.75.75 0 1 1-1.06 1.06L14.78 4.28a.75.75 0 0 1 0-1.06zM18 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 18 10zm-5.22 4.28a.75.75 0 0 1 0 1.06l-1.22 1.22a.75.75 0 0 1-1.06-1.06l1.22-1.22a.75.75 0 0 1 1.06 0z"></path></svg>
            {room.parkingCapacityMotorcycles} Motor
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <button
                onClick={() => navigate(`/rooms/edit/${roomId}`)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Room Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{room.description}</p>
            </section>
            
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {formatAmenity(amenity)}
                  </div>
                ))}
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Upcoming Reservations</h2>
              {reservations.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="divide-y divide-gray-200">
                    {reservations.slice(0, 3).map(reservation => (
                      <li key={reservation.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{reservation.title}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            reservation.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : reservation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {reservations.length > 3 && (
                    <div className="mt-3 text-center">
                      <Link 
                        to="/rooms/reservations" 
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        View all {reservations.length} reservations
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No upcoming reservations</p>
                </div>
              )}
            </section>
          </div>
          
          {/* Booking Panel */}
          <div className="bg-gray-50 p-4 rounded-lg h-fit">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Book this room</h3>
            
            {room.isAvailable ? (
              <>
                <div className="mb-4">
                  <Link
                    to={`/rooms/${roomId}/reserve`}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center"
                  >
                    Reserve Now
                  </Link>
                </div>
                
                <div className="mb-4">
                  <button
                    onClick={handleWhatsAppBooking}
                    className="w-full py-2 px-4 border border-green-500 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Book via WhatsApp
                  </button>
                </div>
                
                <div className="mb-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reservation Policy</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-gray-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Reservations can be made up to 30 days in advance</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-gray-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Free cancellation up to 24 hours before reservation</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-gray-500 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Late cancellations may incur a fee</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Currently Unavailable</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>This room is currently not available for booking.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={() => navigate('/rooms')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Rooms
        </button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this room? All reservations for this room will also be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">Share Room</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowShareModal(false)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4">
              <div className="flex flex-col space-y-4">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Share on Facebook
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Share on Twitter
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Share via WhatsApp
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetail; 