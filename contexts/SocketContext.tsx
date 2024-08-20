"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
// import { AuthContext } from './AuthContext'; // Adjust the import according to your project structure
import * as authSvc from "../services/auth";
import * as userSvc from "../services/userService";
import CryptoJS from "crypto-js";
// import { api } from '../environments/environment'; // Adjust the import according to your project structure
import { useSession } from "next-auth/react";

export const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const currentUser: any = useSession()?.data?.user?.info || {};
  const token = useSession()?.data?.accessToken || "";
  const [socket, setSocket] = useState(null);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const handlerCached: any = {};
  const apiKey = "f2)2-EDu-lonYuqcGTat!AEI$7VzsNEW";

  useEffect(() => {
    let _socket: any;

    const connectSocket = () => {
      if (connecting) return;

      if (token) {
        setConnecting(true);
        console.log("usecontext1");

        if (!_socket) {
          console.log("usecontext2");

          _socket = io("/ns-" + CryptoJS.MD5(apiKey), {
            transports: ["websocket"],
            path: "/socket-client",
            query: { token },
          });
          console.log(_socket, "socket");
          monitorSocket(_socket);
        } else {
          _socket.io.opts.query = { token };
          _socket.connect();
        }
      }
    };

    const disconnectSocket = () => {
      console.log("disconnect socket");
      if (_socket) {
        _socket.disconnect();
      }
    };

    const monitorSocket = (socketInstance: any) => {
      socketInstance.on("connect", () => {
        setConnecting(false);
        setIsDisconnected(false);
        console.log("socket connected");
      });

      socketInstance.on("connect_error", () => {
        setSocket(null);
        setConnecting(false);
        setIsDisconnected(true);
      });

      socketInstance.on("connect_timeout", () => {
        setSocket(null);
        setConnecting(false);
        setIsDisconnected(true);
      });

      socketInstance.on("error", (reason: any) => {
        setSocket(null);
        setConnecting(false);
        setIsDisconnected(true);
        console.log("socket disconnected with error", reason);
      });

      socketInstance.on("disconnect", () => {
        setSocket(null);
        setConnecting(false);
        setIsDisconnected(true);
        console.log("socket disconnected");
      });

      socketInstance.on("reconnect_attempt", () => {
        console.log("socket reconnecting...", token);
        socketInstance.io.opts.query = { token };
      });

      socketInstance.on("connection.ready", () => {
        setSocket(socketInstance);
        console.log("connection.ready");
        if (currentUser && currentUser.activeLocation) {
          emit("location.join", { location: currentUser.activeLocation });
        }
      });
    };

    if (token) {
      connectSocket();
    }

    return () => {
      if (_socket) {
        _socket.disconnect();
      }
    };
  }, [token, currentUser, connecting]);

  const emit = async (eventName, ...args) => {
    if (!currentUser) return;
    if (!socket) return;
    socket.emit(eventName, ...args);
  };

  const on = async (eventName, callback, uid) => {
    if (!currentUser) return;
    if (!socket) return;
    socket.on(eventName, callback);
    if (uid) {
      if (!handlerCached[uid]) {
        handlerCached[uid] = [];
      }
      handlerCached[uid].push({ e: eventName, c: callback });
    }
  };

  const off = async (uid) => {
    if (!currentUser) return;
    if (!handlerCached[uid]) return;
    if (!socket) return;
    handlerCached[uid].forEach((cb) => {
      socket.removeListener(cb.e, cb.c);
    });
  };

  const removeListener = async (eventName, callback) => {
    if (!socket) return;
    socket.removeListener(eventName, callback);
  };

  const removeAllListeners = async (eventName) => {
    if (!socket) return;
    socket.removeAllListeners(eventName);
  };

  const getUniqueId = (parts) => {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      const S4 = (((1 + Math.random()) * 0x10000) | 0)
        .toString(16)
        .substring(1);
      stringArr.push(S4);
    }
    return stringArr.join("-");
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected: !isDisconnected,
        emit,
        on,
        off,
        removeListener,
        removeAllListeners,
        getUniqueId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
