import { io } from "socket.io-client";
import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const socket = io(API_BASE_URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: getToken() });
  }
});