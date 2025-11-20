// Base API root depending on environment
const backendHost = process.env.NEXT_PUBLIC_API_URL || "http://musicarr-backend";
const endpointRoot = typeof window === "undefined" ? backendHost : process.env.NEXT_PUBLIC_API_URL || "";

// API endpoints
const endpointApi = endpointRoot + "/api";
const endpointPlaylists = endpointApi + "/playlists";
const endpointVideos = endpointApi + "/videos";
const endpointUploaders = endpointApi + "/uploaders";
const endpointPaths = endpointApi + "/paths";
const endpointManageData = endpointApi + "/manage_data";
const endpointSearchMusic = endpointApi + "/search_music"

// WebSocket endpoints
const endpointWebSocket = process.env.NEXT_PUBLIC_WS_URL || "/ws";

const endpointWebSocketPlaylists = endpointWebSocket + "/playlists";
const endpointWebSocketVideos = endpointWebSocket + "/videos";
const endpointWebSocketUploaders = endpointWebSocket + "/uploaders";

// Static metadata
const endpointUploadersAvatar = backendHost + "/metadata/avatars";

// Export all endpoints
export {
  endpointApi,
  endpointPlaylists,
  endpointVideos,
  endpointPaths,
  endpointUploaders,
  endpointUploadersAvatar,
  endpointManageData,
  endpointSearchMusic,
  endpointWebSocket,
  endpointWebSocketPlaylists,
  endpointWebSocketVideos,
  endpointWebSocketUploaders,
};
