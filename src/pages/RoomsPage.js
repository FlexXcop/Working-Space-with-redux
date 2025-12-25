import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { formatRupiah } from '../utils/formatters'; 
import { useSelector, useDispatch } from 'react-redux';
import { selectFilteredRooms, setFilters, clearFilters, selectAllRooms } from '../features/rooms/roomsSlice';
import RoomDetail from '../components/rooms/RoomDetail';
import ReservationForm from '../components/rooms/ReservationForm';
import ReservationDetail from '../components/rooms/ReservationDetail';
import RoomForm from '../components/rooms/RoomForm';
import ReservationsList from '../components/rooms/ReservationsList';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';

// Room Card Component
const RoomCard = ({ room, onClick }) => {
  const amenityIcons = {
    'projector': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'whiteboard': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    ),
    'video-conferencing': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    'tv-screen': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    'standing-desk': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    'ergonomic-chair': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    'coffee-machine': (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    )
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(room)}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.name}</h3>
          <span className="text-sm font-medium text-gray-700">{formatRupiah(room.hourlyRate)}/jam</span>
        </div>
        {/* <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.name}</h3>
          <span className="text-sm font-medium text-gray-700">${room.hourlyRate}/hr</span>
        </div> */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Capacity: {room.capacity}
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Floor {room.floor}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
              {amenityIcons[amenity] || null}
              <span className="ml-1">{amenity.replace('-', ' ')}</span>
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            room.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {room.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const RoomFilters = ({ onApplyFilters, onClearFilters }) => {
  const [formData, setFormData] = useState({
    capacity: '',
    type: '',
    amenities: [],
    date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, value]
        : prev.amenities.filter(amenity => amenity !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert capacity to number if present
    const filters = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null
    };
    
    onApplyFilters(filters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Rooms</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Capacity Filter */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Capacity
            </label>
            <select
              id="capacity"
              name="capacity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.capacity}
              onChange={handleChange}
            >
              <option value="">Any capacity</option>
              <option value="1">1 person</option>
              <option value="2">2 people</option>
              <option value="4">4 people</option>
              <option value="8">8 people</option>
              <option value="12">12 people</option>
              <option value="20">20+ people</option>
            </select>
          </div>
          
          {/* Room Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Any type</option>
              <option value="conference">Conference Room</option>
              <option value="meeting">Meeting Room</option>
              <option value="brainstorming">Brainstorming Room</option>
              <option value="focus">Focus Room</option>
              <option value="office">Office Suite</option>
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          {/* Availability Filter - Checkbox for simplicity */}
          <div className="flex items-end">
            <label className="inline-flex items-center h-10">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                name="availableOnly"
              />
              <span className="ml-2 text-sm text-gray-700">Available rooms only</span>
            </label>
          </div>
        </div>
        
        {/* Amenities Filter */}
        <div className="mb-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">Amenities</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {['projector', 'whiteboard', 'video-conferencing', 'tv-screen', 'standing-desk', 'ergonomic-chair', 'coffee-machine', 'private-bathroom', 'mini-fridge', 'noise-cancellation', 'creative-supplies'].map((amenity) => (
              <label key={amenity} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  name="amenities"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleAmenityChange}
                />
                <span className="ml-2 text-sm text-gray-700">{amenity.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

// Rooms List Component
const RoomsList = () => {
  const filteredRooms = useSelector(selectFilteredRooms);
  const allRooms = useSelector(selectAllRooms);
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoomClick = (room) => {
    navigate(`/rooms/${room.id}`);
  };

  const handleApplyFilters = (filters) => {
    dispatch(setFilters(filters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };
  
  // Export rooms to PDF
  const exportRoomsToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Co-Working Space Rooms Report', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare rooms table data
    const roomsData = filteredRooms.map(room => [
      room.id,
      room.name,
      room.type,
      room.capacity,
      room.floor,
      `$${room.hourlyRate}`,
      room.isAvailable ? 'Available' : 'Unavailable'
    ]);
    
    // Add rooms table
    doc.setFontSize(16);
    doc.text('Rooms Overview', 14, 40);
    
    doc.autoTable({
      startY: 45,
      head: [['ID', 'Name', 'Type', 'Capacity', 'Floor', 'Hourly Rate', 'Status']],
      body: roomsData,
    });
    
    // Get room amenities data for another table
    const roomDetailsY = doc.previousAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Room Details & Amenities', 14, roomDetailsY);
    
    const roomDetailsData = filteredRooms.map(room => [
      room.name,
      room.amenities.join(', '),
      room.description.length > 60 ? room.description.substring(0, 60) + '...' : room.description
    ]);
    
    doc.autoTable({
      startY: roomDetailsY + 5,
      head: [['Room', 'Amenities', 'Description']],
      body: roomDetailsData,
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 70 },
        2: { cellWidth: 90 }
      }
    });
    
    // Room type summary
    const roomTypeSummaryY = doc.previousAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (roomTypeSummaryY > 250) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Room Type Summary', 14, 20);
      
      // Get room counts by type
      const roomsByType = {};
      filteredRooms.forEach(room => {
        if (!roomsByType[room.type]) {
          roomsByType[room.type] = 0;
        }
        roomsByType[room.type]++;
      });
      
      const roomTypeData = Object.entries(roomsByType).map(([type, count]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        count,
        `${((count / filteredRooms.length) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 25,
        head: [['Room Type', 'Count', 'Percentage']],
        body: roomTypeData,
      });
    } else {
      doc.setFontSize(16);
      doc.text('Room Type Summary', 14, roomTypeSummaryY);
      
      // Get room counts by type
      const roomsByType = {};
      filteredRooms.forEach(room => {
        if (!roomsByType[room.type]) {
          roomsByType[room.type] = 0;
        }
        roomsByType[room.type]++;
      });
      
      const roomTypeData = Object.entries(roomsByType).map(([type, count]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        count,
        `${((count / filteredRooms.length) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: roomTypeSummaryY + 5,
        head: [['Room Type', 'Count', 'Percentage']],
        body: roomTypeData,
      });
    }
    
    // Save the PDF
    doc.save(`rooms-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  // Prepare CSV data for export
  const roomsCSVData = [
    ['ID', 'Name', 'Type', 'Floor', 'Capacity', 'Hourly Rate', 'Amenities', 'Status', 'Description'],
    ...filteredRooms.map(room => [
      room.id,
      room.name,
      room.type,
      room.floor,
      room.capacity,
      room.hourlyRate,
      room.amenities.join(', '),
      room.isAvailable ? 'Available' : 'Unavailable',
      room.description
    ])
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <Link
              to="/rooms/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Room
            </Link>
          )}
          
          <div className="dropdown relative">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="dropdown-menu hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <button
                  onClick={exportRoomsToPDF}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                >
                  Export to PDF
                </button>
                <CSVLink
                  data={roomsCSVData}
                  filename={`rooms-${new Date().toISOString().slice(0, 10)}.csv`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                >
                  Export to CSV
                </CSVLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Filters */}
      <RoomFilters 
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      
      {/* Room Grid */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <RoomCard 
              key={room.id}
              room={room}
              onClick={handleRoomClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filter criteria or clear all filters to see all available rooms.</p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

// Main Rooms Page component with routing
const RoomsPage = () => {
  return (
    <Routes>
      <Route path="/" element={<RoomsList />} />
      <Route path="/new" element={<RoomForm />} />
      <Route path="/:roomId" element={<RoomDetail />} />
      <Route path="/:roomId/reserve" element={<ReservationForm />} />
      <Route path="/reservations" element={<ReservationsList />} />
      <Route path="/reservations/:reservationId" element={<ReservationDetail />} />
    </Routes>
  );
};

export default RoomsPage; 