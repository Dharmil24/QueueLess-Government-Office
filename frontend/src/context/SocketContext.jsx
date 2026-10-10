import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioContextRef = useRef(null);

  // Play pleasant government counter chime using Web Audio API
  const playAnnouncementChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // First chime tone (high pleasant chime)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Second tone (harmonic chime)
      setTimeout(() => {
        if (!ctx) return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.8);
      }, 200);
    } catch (err) {
      console.warn('Audio chime playback omitted or unsupported:', err);
    }
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected to live queue server, socket id:', s.id);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected from live queue server');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Listen for user-specific events when user is logged in
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join_user', user._id);

      const handleDirectCall = (data) => {
        playAnnouncementChime();
        toast.success(`TOKEN CALLED: Proceed to ${data.counterNumber}!`, {
          duration: 10000,
          icon: '📢',
        });
      };

      const handleNotification = (data) => {
        toast(data.title, {
          icon: data.type === 'APPROACHING' ? '⏳' : '🔔',
          duration: 6000,
        });
      };

      socket.on('token_called_direct', handleDirectCall);
      socket.on('new_notification', handleNotification);

      return () => {
        socket.off('token_called_direct', handleDirectCall);
        socket.off('new_notification', handleNotification);
      };
    }
  }, [socket, user]);

  const joinOffice = (officeId) => {
    if (socket && officeId) {
      socket.emit('join_office', officeId);
    }
  };

  const leaveOffice = (officeId) => {
    if (socket && officeId) {
      socket.emit('leave_office', officeId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinOffice,
        leaveOffice,
        playAnnouncementChime,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
