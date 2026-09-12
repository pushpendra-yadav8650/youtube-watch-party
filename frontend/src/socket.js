import { io } from "socket.io-client";
import { API_URL } from "./api";

// One shared socket connection for the whole app. It connects lazily
// (autoConnect: false) so we only open the WebSocket once the user
// actually enters a watch room.
export const socket = io(API_URL, { autoConnect: false });