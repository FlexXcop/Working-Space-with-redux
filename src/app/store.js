import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import roomsReducer from '../features/rooms/roomsSlice';
import usersReducer from '../features/users/usersSlice';
import reportsReducer from '../features/reports/reportsSlice';
import themeReducer from '../features/theme/themeSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'rooms', 'users'] // Persist auth and theme state
};

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
  rooms: roomsReducer,
  users: usersReducer,
  reports: reportsReducer,
  theme: themeReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    },
  }),
});

export const persistor = persistStore(store); 