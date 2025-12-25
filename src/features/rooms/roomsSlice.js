import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const mockRooms = [
  {
    id: 1,
    name: 'Orion Conference Room',
    type: 'conference',
    capacity: 20,
    floor: 1,
    amenities: ['projector', 'whiteboard', 'video-conferencing'],
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Large conference room perfect for team meetings and presentations.',
    hourlyRate: 50000,
    parkingCapacityCars: 5,    
    parkingCapacityMotorcycles: 10,
    isAvailable: true
  },
  {
    id: 2,
    name: 'Phoenix Meeting Room',
    type: 'meeting',
    capacity: 8,
    floor: 1,
    amenities: ['whiteboard', 'tv-screen'],
    image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Mid-sized meeting room for small team discussions.',
    hourlyRate: 35000,
    parkingCapacityCars: 2,    
    parkingCapacityMotorcycles: 15,
    isAvailable: true
  },
  {
    id: 3,
    name: 'Pegasus Brainstorm Room',
    type: 'brainstorming',
    capacity: 6,
    floor: 2,
    amenities: ['whiteboard', 'standing-desk', 'creative-supplies'],
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Creative space designed for brainstorming and ideation sessions.',
    hourlyRate: 40000,
    parkingCapacityCars: 2,     
    parkingCapacityMotorcycles: 15,
    isAvailable: true
  },
  {
    id: 4,
    name: 'Cassiopeia Quiet Room',
    type: 'focus',
    capacity: 1,
    floor: 2,
    amenities: ['ergonomic-chair', 'noise-cancellation'],
    image: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Private focus room for individual work requiring concentration.',
    hourlyRate: 75000,
    parkingCapacityCars: 0,     
    parkingCapacityMotorcycles: 5,
    isAvailable: false
  },
  {
    id: 5,
    name: 'Andromeda Office Suite',
    type: 'office',
    capacity: 40000,
    floor: 3,
    amenities: ['private-bathroom', 'coffee-machine', 'mini-fridge'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Premium office suite for executives or small teams needing privacy.',
    hourlyRate: 85000,
    parkingCapacityCars: 1,     
    parkingCapacityMotorcycles: 2,
    isAvailable: true
  },
  {
    id: 6, 
    name: 'Gemini Creative Hub',
    type: 'brainstorming',
    capacity: 10,
    floor: 3,
    amenities: ['whiteboard', 'tv-screen', 'coffee-machine', 'creative-supplies'],
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    description: 'Ruang kolaboratif yang didesain untuk memicu kreativitas dan inovasi.',
    hourlyRate: 72000,
    parkingCapacityCars: 3,
    parkingCapacityMotorcycles: 20,
    isAvailable: true
  }
];

const mockReservations = [
  {
    id: 1,
    roomId: 1,
    userId: 2,
    title: 'Quarterly Planning',
    startTime: '2025-07-15T09:00:00',
    endTime: '2025-07-15T12:00:00',
    attendees: 12,
    status: 'confirmed',
    createdAt: '2025-07-01T10:15:00',
    notes: 'Need projector and video conferencing setup'
  },
  {
    id: 2,
    roomId: 3,
    userId: 3,
    title: 'Design Sprint',
    startTime: '2025-07-16T13:00:00',
    endTime: '2025-07-16T17:00:00',
    attendees: 5,
    status: 'confirmed',
    createdAt: '2025-07-02T14:30:00',
    notes: 'Will need extra creative supplies'
  },
  {
    id: 3,
    roomId: 2,
    userId: 2,
    title: 'Client Meeting',
    startTime: '2025-07-17T10:00:00',
    endTime: '2025-07-17T11:30:00',
    attendees: 6,
    status: 'pending',
    createdAt: '2025-07-05T09:45:00',
    notes: 'Prepare presentation materials'
  },
  {
    id: 4,
    roomId: 5,
    userId: 1,
    title: 'Executive Meeting',
    startTime: '2025-07-18T15:00:00',
    endTime: '2025-07-18T17:00:00',
    attendees: 3,
    status: 'pending',
    createdAt: '2025-07-11T11:15:00',
    notes: 'Confidential meeting'
  }
];


// initial state

const initialState = {
  rooms: mockRooms,
  reservations: mockReservations,
  loading: false,
  error: null,
  filters: {
    capacity: null,
    type: null,
    amenities: [],
    date: null
  }
};

// helper

/**
 * Memeriksa apakah sebuah reservasi baru berkonflik dengan reservasi lain yang sudah disetujui.
 * @param {object} state - State Redux saat ini, harus memiliki `state.rooms.reservations`.
 * @param {object} newReservation - Objek reservasi baru atau yang akan diubah.
 * @returns {boolean} - `true` jika ada konflik, `false` jika tidak.
 */
export const hasBookingConflict = (state, newReservation) => {
  const { roomId, startTime, endTime, id: newReservationId } = newReservation;
  const newStartTime = new Date(startTime).getTime();
  const newEndTime = new Date(endTime).getTime();

  // Ambil hanya reservasi yang sudah dikonfirmasi untuk ruangan yang sama
  const existingConfirmedReservations = state.rooms.reservations.filter(
    (reservation) =>
      reservation.roomId === roomId &&
      reservation.status === 'confirmed' &&
      reservation.id !== (newReservationId || -1) // Abaikan diri sendiri saat edit/extend
  );

  // Periksa apakah ada yang tumpang tindih
  return existingConfirmedReservations.some(reservation => {
    const existingStartTime = new Date(reservation.startTime).getTime();
    const existingEndTime = new Date(reservation.endTime).getTime();
    // Kondisi tumpang tindih: waktu mulai baru < waktu selesai lama DAN waktu selesai baru > waktu mulai lama
    return newStartTime < existingEndTime && newEndTime > existingStartTime;
  });
};

//  async thunk baru untuk persetujuan reservasi yang aman

export const approveReservation = createAsyncThunk(
  'rooms/approveReservation',
  async (reservationId, { getState, rejectWithValue }) => {
    const state = getState();
    const reservationToApprove = state.rooms.reservations.find(r => r.id === reservationId);

    if (!reservationToApprove) {
      return rejectWithValue('Reservasi tidak ditemukan.');
    }

    const conflict = hasBookingConflict(state, reservationToApprove);

    if (conflict) {
      return rejectWithValue('Gagal disetujui: Waktu bentrok dengan reservasi lain yang sudah dikonfirmasi.');
    }

    // Jika tidak ada konflik, kembalikan ID reservasi sebagai tanda sukses
    return reservationId;
  }
);

// create slice

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    addRoom: (state, action) => {
      state.rooms.push({
        ...action.payload,
        id: Math.max(0, ...state.rooms.map(r => r.id)) + 1,
        isAvailable: true,
      });
    },
    updateRoom: (state, action) => {
      const index = state.rooms.findIndex(room => room.id === action.payload.id);
      if (index !== -1) {
        state.rooms[index] = { ...state.rooms[index], ...action.payload };
      }
    },
    deleteRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      state.reservations = state.reservations.filter(res => res.roomId !== action.payload);
    },
    addReservation: (state, action) => {
      state.reservations.push({
        ...action.payload,
        id: Math.max(0, ...state.reservations.map(r => r.id)) + 1,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    },
    updateReservation: (state, action) => {
      const index = state.reservations.findIndex(res => res.id === action.payload.id);
      if (index !== -1) {
        state.reservations[index] = { ...state.reservations[index], ...action.payload };
      }
    },
    deleteReservation: (state, action) => {
      state.reservations = state.reservations.filter(res => res.id !== action.payload);
    },
    rejectReservation: (state, action) => {
      const reservation = state.reservations.find(res => res.id === action.payload);
      if (reservation) {
        reservation.status = 'rejected';
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  // extra reducer buat nangani asinkron
  extraReducers: (builder) => {
    builder
      .addCase(approveReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveReservation.fulfilled, (state, action) => {
        const reservation = state.reservations.find(res => res.id === action.payload);
        if (reservation) {
          reservation.status = 'confirmed';
        }
        state.loading = false;
      })
      .addCase(approveReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      });
  },
});

export const {
  addRoom,
  updateRoom,
  deleteRoom,
  addReservation,
  updateReservation,
  deleteReservation,
  rejectReservation,
  setFilters,
  clearFilters
} = roomsSlice.actions;

export const selectAllRooms = (state) => state.rooms.rooms;
export const selectRoomById = (state, roomId) =>
  state.rooms.rooms.find((room) => room.id === roomId);

export const selectFilteredRooms = (state) => {
  const { rooms, filters } = state.rooms;
  return rooms.filter(room => {
    if (filters.capacity && room.capacity < filters.capacity) return false;
    if (filters.type && room.type !== filters.type) return false;
    if (filters.amenities.length > 0) {
      if (!filters.amenities.every(amenity => room.amenities.includes(amenity))) {
        return false;
      }
    }
    // filter tanggal yang lebih kompleks bisa ditambahkan di sini
    return true;
  });
};

export const selectAllReservations = (state) => state.rooms.reservations;
export const selectReservationById = (state, reservationId) =>
  state.rooms.reservations.find((reservation) => reservation.id === reservationId);
export const selectReservationsByRoom = (state, roomId) =>
  state.rooms.reservations.filter((reservation) => reservation.roomId === roomId);
export const selectReservationsByUser = (state, userId) =>
  state.rooms.reservations.filter((reservation) => reservation.userId === userId);
export const selectPendingReservations = (state) =>
  state.rooms.reservations.filter((reservation) => reservation.status === 'pending');

export default roomsSlice.reducer;