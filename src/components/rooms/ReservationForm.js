import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { formatRupiah } from '../../utils/formatters'; 
import { selectRoomById, addReservation, hasBookingConflict } from '../../features/rooms/roomsSlice';


const ParkingSuggestion = ({ numCars, numMotorcycles, room }) => {
  // gak tampilkan apa-apa jika tidak ada kendaraan atau data ruangan
  if (!room || (numCars === 0 && numMotorcycles === 0)) {
    return null;
  }

  const carCapacity = room.parkingCapacityCars || 0;
  const motorCapacity = room.parkingCapacityMotorcycles || 0;

  const carExceeded = numCars > carCapacity;
  const motorExceeded = numMotorcycles > motorCapacity;

  //  pesan sukses jika kapasitas mencukupi
  if (!carExceeded && !motorExceeded) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4 rounded-r-lg">
        <p className="text-sm text-green-800">Kapasitas parkir tersedia untuk jumlah kendaraan Anda.</p>
      </div>
    );
  }

  //  peringatan dan saran jika kapasitas terlampaui
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.863-1.214 3.5 0l5.485 10.473c.48 1.026-.226 2.178-1.458 2.178H4.229c-1.232 0-1.938-1.152-1.458-2.178L8.257 3.099zM10 12a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Perhatian Kapasitas Parkir</h3>
          <div className="mt-2 text-sm text-yellow-700 space-y-1">
            {carExceeded && <p>Kapasitas parkir mobil hanya untuk <strong>{carCapacity}</strong>, namun Anda berencana membawa <strong>{numCars}</strong>.</p>}
            {motorExceeded && <p>Kapasitas parkir motor hanya untuk <strong>{motorCapacity}</strong>, namun Anda berencana membawa <strong>{numMotorcycles}</strong>.</p>}
            {carExceeded && <p className="mt-2"><b>Saran:</b> Pertimbangkan untuk carpooling (berbagi mobil) atau menggunakan ride-sharing untuk mengurangi jumlah mobil.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};


const ReservationForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const parsedRoomId = parseInt(roomId);
  const room = useSelector(state => selectRoomById(state, parsedRoomId));
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    notes: '',
    contactPhone: '',
    numCars: '',
    numMotorcycles: '', 
  });
  
  const [dateOnly, setDateOnly] = useState('');
  const [startTimeOnly, setStartTimeOnly] = useState('09:00');
  const [endTimeOnly, setEndTimeOnly] = useState('10:00');
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [reservationId, setReservationId] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(false);
  
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDateOnly(tomorrow.toISOString().slice(0, 10));
  }, []);
  
  useEffect(() => {
    if (dateOnly && startTimeOnly) {
      setFormData(prev => ({
        ...prev,
        startTime: `${dateOnly}T${startTimeOnly}`
      }));
    }
    
    if (dateOnly && endTimeOnly) {
      setFormData(prev => ({
        ...prev,
        endTime: `${dateOnly}T${endTimeOnly}`
      }));
    }
  }, [dateOnly, startTimeOnly, endTimeOnly]);
  
  if (!room) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Room not found</h2>
          <p className="mt-2 text-gray-600">The room you're trying to reserve doesn't exist or has been removed.</p>
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    //  nilai numerik tidak negatif
    if (name === 'attendees' || name === 'numCars' || name === 'numMotorcycles') {
      setFormData(prev => ({
        ...prev,
        [name]: Math.max(0, parseInt(value, 10)) || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOnly') {
      setDateOnly(value);
    } else if (name === 'startTimeOnly') {
      setStartTimeOnly(value);
    } else if (name === 'endTimeOnly') {
      setEndTimeOnly(value);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Reservation title is required';
    }
    
    if (!dateOnly) {
      newErrors.dateOnly = 'Date is required';
    }
    
    if (!startTimeOnly) {
      newErrors.startTimeOnly = 'Start time is required';
    }
    
    if (!endTimeOnly) {
      newErrors.endTimeOnly = 'End time is required';
    }
    
    if (startTimeOnly && endTimeOnly && startTimeOnly >= endTimeOnly) {
      newErrors.endTimeOnly = 'End time must be after start time';
    }
    
    if (formData.attendees < 1) {
      newErrors.attendees = 'At least 1 attendee is required';
    }
    
    if (formData.attendees > room.capacity) {
      newErrors.attendees = `Maximum ${room.capacity} attendees allowed for this room`;
    }
    
    // Validate phone number format
    if (formData.contactPhone) {
  const phone = formData.contactPhone.replace(/[\s\-]/g, '');
  if (!/^62[0-9]{8,15}$/.test(phone)) {
    newErrors.contactPhone = 'Please enter a valid phone number';
  }
}
    
    setConflictWarning(false);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
const reservations = useSelector(state => state.rooms.reservations);

const handleSubmit = (e) => {
  e.preventDefault();

  if (validateForm()) {
    const newReservation = {
      roomId: parsedRoomId,
      userId: user.id,
      title: formData.title,
      startTime: formData.startTime,
      endTime: formData.endTime,
      attendees: parseInt(formData.attendees),
      notes: formData.notes,
      contactPhone: formData.contactPhone || null
    };

    // Gunakan reservations dari atas, jangan useSelector di sini
    const conflict = hasBookingConflict(
      { rooms: { reservations } },
      newReservation
    );

    if (conflict) {
      setConflictWarning(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    dispatch(addReservation(newReservation));

    // ngambil ID terakhir dari reservations yang sudah diupdate
    // krn dispatch sinkron, kita bisa ambil dari reservations + 1
    const lastId = Math.max(0, ...reservations.map(r => r.id)) + 1;
    setReservationId(lastId);

    setShowSuccess(true);

    setTimeout(() => {
      navigate(`/rooms/${roomId}`);
    }, 5000);
  }
};
  
  const handleForceSubmit = () => {
    const newReservation = {
      roomId: parsedRoomId,
      userId: user.id,
      title: formData.title,
      startTime: formData.startTime,
      endTime: formData.endTime,
      attendees: parseInt(formData.attendees),
      notes: formData.notes,
      contactPhone: formData.contactPhone || null,
      // we bisa juga menyimpan rencana parkir jika diperlukan
      // numCars: formData.numCars || 0,
      // numMotorcycles: formData.numMotorcycles || 0
    };
    
    const action = dispatch(addReservation(newReservation));
    const newId = action.payload.id;
    setReservationId(newId);
    
    setShowSuccess(true);
  
    setConflictWarning(false);
    
    setTimeout(() => {
      navigate(`/rooms/${roomId}`);
    }, 5000);
  };
  
  // generate time options (30 minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute of ['00', '30']) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
        const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
        options.push(
          <option key={timeValue} value={timeValue}>
            {displayTime}
          </option>
        );
      }
    }
    return options;
  };
  
  // vreate WhatsApp share link
  const getWhatsAppShareLink = () => {
    if (!reservationId) return '#';
    
    const formatPhone = (phone) => {
    return phone.replace(/[^0-9]/g, '');
  };
    
    const message = encodeURIComponent(
      `*Room Reservation Details*\n\n` +
      `Room: ${room.name}\n` +
      `Date: ${dateOnly}\n` +
      `Time: ${startTimeOnly} to ${endTimeOnly}\n` +
      `Title: ${formData.title}\n` +
      `Attendees: ${formData.attendees}\n\n` +
      `Your reservation is pending approval. You will be notified once it's confirmed.`
    );
    
  return phone
    ? `https://wa.me/${phone}?text=${message}`
    : `https://wa.me/?text=${message}`;
  };
  
  // create calendar invite link (ICS file)
  const getCalendarLink = () => {
    if (!reservationId) return '#';
    
    const formatICSDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDate = formatICSDate(formData.startTime);
    const endDate = formatICSDate(formData.endTime);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${formData.title}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `LOCATION:${room.name}, Floor ${room.floor}`,
      `DESCRIPTION:Reservation at ${room.name}. ${formData.notes || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-3xl mx-auto">
      <div className="p-6 bg-blue-700 text-white">
        <h1 className="text-xl font-bold">Reserve Room</h1>
        <p className="text-blue-100">{room.name}</p>
      </div>
      
      {showSuccess ? (
        <div className="p-6 text-center">
          <div className="bg-green-50 rounded-md p-4 mb-6">
            <svg className="h-12 w-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 mt-3">Reservation Submitted!</h2>
            <p className="text-gray-600 mt-1">Your reservation is pending approval. You'll be notified once it's confirmed.</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Share your reservation:</h3>
            <div className="flex justify-center space-x-4">
              <a 
                href={getWhatsAppShareLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Share on WhatsApp
              </a>
              <a 
                href={getCalendarLink()} 
                download={`reservation-${room.name.toLowerCase().replace(/\s+/g, '-')}.ics`}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add to Calendar
              </a>
            </div>
          </div>
          
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate(`/rooms/${roomId}`)}
          >
            Return to Room Details
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          {/* Conflict Warning */}
          {conflictWarning && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Booking Conflict Detected</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The selected time slot conflicts with an existing reservation for this room.</p>
                    <p className="mt-2">Please select a different time or date.</p>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleForceSubmit}
                      >
                        Submit anyway (pending admin approval)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {/* Room Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
                  <p className="text-sm text-gray-600">
                    Kapasitas: {room.capacity} • Lantai {room.floor} • {formatRupiah(room.hourlyRate)}/jam
                  </p>
                  {/* <p className="text-sm text-gray-600">
                    Capacity: {room.capacity} • Floor {room.floor} • ${room.hourlyRate}/hour
                  </p> */}
                </div>
              </div>
            </div>
            
            {/* Reservation Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Reservation Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter reservation purpose (e.g. 'Team Meeting')"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="dateOnly" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="dateOnly"
                  name="dateOnly"
                  required
                  className={`w-full px-3 py-2 border ${errors.dateOnly ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={dateOnly}
                  onChange={handleDateTimeChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOnly && <p className="mt-1 text-sm text-red-600">{errors.dateOnly}</p>}
              </div>
              
              <div>
                <label htmlFor="startTimeOnly" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <select
                  id="startTimeOnly"
                  name="startTimeOnly"
                  required
                  className={`w-full px-3 py-2 border ${errors.startTimeOnly ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={startTimeOnly}
                  onChange={handleDateTimeChange}
                >
                  {generateTimeOptions()}
                </select>
                {errors.startTimeOnly && <p className="mt-1 text-sm text-red-600">{errors.startTimeOnly}</p>}
              </div>
              
              <div>
                <label htmlFor="endTimeOnly" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <select
                  id="endTimeOnly"
                  name="endTimeOnly"
                  required
                  className={`w-full px-3 py-2 border ${errors.endTimeOnly ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={endTimeOnly}
                  onChange={handleDateTimeChange}
                >
                  {generateTimeOptions()}
                </select>
                {errors.endTimeOnly && <p className="mt-1 text-sm text-red-600">{errors.endTimeOnly}</p>}
              </div>
            </div>
            
            {/* Duration */}
            {startTimeOnly && endTimeOnly && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Duration: {calculateDuration(startTimeOnly, endTimeOnly)}
                    {' • '}
                    Estimated Cost: ${calculateCost(startTimeOnly, endTimeOnly, room.hourlyRate)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Number of Attendees */}
            <div>
              <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Attendees *
              </label>
              <input
                type="number"
                id="attendees"
                name="attendees"
                min="1"
                max={room.capacity}
                required
                className={`w-full px-3 py-2 border ${errors.attendees ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={formData.attendees}
                onChange={handleChange}
              />
              {errors.attendees ? (
                <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Maximum capacity: {room.capacity} people</p>
              )}
            </div>
            
            {/* Contact Phone for WhatsApp */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone Number (for WhatsApp notifications)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  className={`w-full px-3 py-2 border ${errors.contactPhone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="+1 (123) 456-7890"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </div>
              {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
              <p className="mt-1 text-xs text-gray-500">Optional. Include country code for international numbers.</p>
            </div>

            {/* input baru kendaraan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <label htmlFor="numCars" className="block text-sm font-medium text-gray-700 mb-1">Number of Cars</label>
                <input type="number" id="numCars" name="numCars" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Cth: 2" value={formData.numCars} onChange={handleChange}/>
              </div>
              <div>
                <label htmlFor="numMotorcycles" className="block text-sm font-medium text-gray-700 mb-1">Number of Motorcycles</label>
                <input type="number" id="numMotorcycles" name="numMotorcycles" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Cth: 4" value={formData.numMotorcycles} onChange={handleChange}/>
              </div>
            </div>
            
            {/* Menampilkan Komponen Saran Parkir */}
            <ParkingSuggestion
              numCars={formData.numCars || 0}
              numMotorcycles={formData.numMotorcycles || 0}
              room={room}
            />
            
            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or setup instructions?"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
            
            {/* Reservation Policy */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <h3 className="font-medium mb-2">Reservation Policy</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Reservations can be made up to 30 days in advance</li>
                <li>All reservations are subject to approval</li>
                <li>Free cancellation up to 24 hours before reservation</li>
                <li>Please leave the room clean and organized after use</li>
              </ul>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/rooms/${roomId}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reserve Room
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

// Utility function to calculate duration between two time strings (HH:MM format)
function calculateDuration(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    return 'Invalid time range';
  }
  
  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
}

// Utility function to calculate cost based on hourly rate
function calculateCost(startTime, endTime, hourlyRate) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    return formatRupiah(0); // <-- Perubahan di sini
  }

  const durationHours = (endMinutes - startMinutes) / 60;
  const cost = durationHours * hourlyRate;

  return formatRupiah(cost); 
}
// Utility function to calculate cost based on hourly rate
// function calculateCost(startTime, endTime, hourlyRate) {
//   const [startHour, startMinute] = startTime.split(':').map(Number);
//   const [endHour, endMinute] = endTime.split(':').map(Number);
  
//   const startMinutes = startHour * 60 + startMinute;
//   const endMinutes = endHour * 60 + endMinute;
  
//   if (endMinutes <= startMinutes) {
//     return '0';
//   }
  
//   const durationHours = (endMinutes - startMinutes) / 60;
//   const cost = durationHours * hourlyRate;
  
//   return cost.toFixed(2);
// }



export default ReservationForm; 