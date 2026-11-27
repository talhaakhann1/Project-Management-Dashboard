import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

let socketInstance: Socket | null = null;

export function getSocket(isLoggedIn?: boolean): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      autoConnect: false,
    });
  }

  return socketInstance;
}

export function connectSocket(isLoggedIn?: boolean): Socket {
  const socket = getSocket(isLoggedIn);
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
  }
}
