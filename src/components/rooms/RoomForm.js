import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { addRoom, updateRoom, selectRoomById } from '../../features/rooms/roomsSlice';

const RoomForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const isEditMode = Boolean(roomId);
  
  const existingRoom = useSelector(state => 
    isEditMode ? selectRoomById(state, parseInt(roomId)) : null
  );
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'meeting',
    floor: 1,
    capacity: 1,
    hourlyRate: 25,
    amenities: [],
    description: '',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    isAvailable: true
  });
  
  // Amenities checklist options
  const amenityOptions = [
    { id: 'projector', label: 'Projector' },
    { id: 'whiteboard', label: 'Whiteboard' },
    { id: 'video-conferencing', label: 'Video Conferencing' },
    { id: 'tv-screen', label: 'TV Screen' },
    { id: 'standing-desk', label: 'Standing Desk' },
    { id: 'ergonomic-chair', label: 'Ergonomic Chair' },
    { id: 'coffee-machine', label: 'Coffee Machine' },
    { id: 'private-bathroom', label: 'Private Bathroom' },
    { id: 'mini-fridge', label: 'Mini Fridge' },
    { id: 'noise-cancellation', label: 'Noise Cancellation' },
    { id: 'creative-supplies', label: 'Creative Supplies' }
  ];
  
  // Room type options
  const roomTypes = [
    { value: 'meeting', label: 'Meeting Room' },
    { value: 'conference', label: 'Conference Room' },
    { value: 'brainstorming', label: 'Brainstorming Room' },
    { value: 'focus', label: 'Focus Room' },
    { value: 'office', label: 'Office Suite' }
  ];
  
  // Load existing room data when in edit mode
  useEffect(() => {
    if (isEditMode && existingRoom) {
      setFormData({
        name: existingRoom.name || '',
        type: existingRoom.type || 'meeting',
        floor: existingRoom.floor || 1,
        capacity: existingRoom.capacity || 1,
        hourlyRate: existingRoom.hourlyRate || 25,
        amenities: existingRoom.amenities || [],
        description: existingRoom.description || '',
        image: existingRoom.image || '',
        isAvailable: existingRoom.isAvailable !== undefined ? existingRoom.isAvailable : true
      });
    }
  }, [isEditMode, existingRoom]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'isAvailable') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // For amenities checkboxes
        const amenityId = e.target.id;
        if (checked) {
          setFormData(prev => ({
            ...prev,
            amenities: [...prev.amenities, amenityId]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter(amenity => amenity !== amenityId)
          }));
        }
      }
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && existingRoom) {
      dispatch(updateRoom({
        id: parseInt(roomId),
        ...formData
      }));
    } else {
      dispatch(addRoom(formData));
    }
    
    navigate('/rooms');
  };
  
  if (isEditMode && !existingRoom) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium text-gray-900">Room not found</h2>
          <p className="mt-2 text-gray-600">The room you're trying to edit doesn't exist or has been removed.</p>
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
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Room' : 'Create New Room'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter room name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          {/* Room Type */}
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
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {/* Floor */}
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <input
              type="number"
              id="floor"
              name="floor"
              required
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.floor}
              onChange={handleChange}
            />
          </div>
          
          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (people)
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              required
              min="1"
              max="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
          
          {/* Hourly Rate */}
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.hourlyRate}
              onChange={handleChange}
            />
          </div>
          
          {/* Is Available */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              Room is available for booking
            </label>
          </div>
          
          {/* Image URL */}
          <div className="md:col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Room Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter image URL"
              value={formData.image}
              onChange={handleChange}
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Room preview" 
                  className="h-32 w-auto object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Room Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Room Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter room description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Amenities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenityOptions.map(amenity => (
                <div key={amenity.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={amenity.id}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.amenities && formData.amenities.includes(amenity.id)}
                    onChange={handleChange}
                  />
                  <label htmlFor={amenity.id} className="ml-2 block text-sm text-gray-900">
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/rooms')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm; 