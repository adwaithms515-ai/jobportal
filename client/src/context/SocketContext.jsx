import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    // Connect to server
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    setSocket(newSocket);
    console.log('Socket connection initialized.');

    return () => {
      newSocket.close();
      console.log('Socket connection closed.');
    };
  }, []);

  // Listen to user and join personal room
  useEffect(() => {
    if (socket && user) {
      socket.emit('join', user.id);
      console.log(`Socket joining room: ${user.id}`);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
