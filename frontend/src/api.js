const API_URL = import.meta.env.VITE_API_URL || "https://youtube-watch-party-ct6k.onrender.com";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["x-auth-token"] = token;

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  signup: (fullName, email, password) =>
    request("/auth/signup", { method: "POST", body: { fullName, email, password } }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  logout: (token) => request("/auth/logout", { method: "POST", token }),

  me: (token) => request("/auth/me", { token }),

  createRoom: (token, name, privacy) =>
    request("/rooms", { method: "POST", token, body: { name, privacy } }),

  myRooms: (token) => request("/rooms/mine", { token }),

  getRoom: (token, roomCode) => request(`/rooms/${roomCode}`, { token }),
};

export { API_URL };
