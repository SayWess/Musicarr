const endpointRoot = "http://192.168.146.221:8000"; // Change for the ip of the server (pc or nas)
// const endpointRoot = "http://localhost:8000"; // Change for the ip of the server (pc or nas) if you are using localhost
const endpointApi = endpointRoot + "/api";
const endpointPlaylists = endpointApi + "/playlists";
const endpointVideos = endpointApi + "/videos";
const endpointWebSocket = "ws://192.168.146.221:8000/ws";
// const endpointWebSocket = "ws://localhost:8000/ws"; // Change for the ip of the server (pc or nas) if you are using localhost
const endpointWebSocketPlaylists = endpointWebSocket + "/playlists";
const endpointWebSocketVideos = endpointWebSocket + "/videos";

// Enpoints for uploader
const endpointUploaders = endpointApi + "/uploaders";
const endpointUploadersAvatar = endpointRoot + "/metadata/avatars";
const endpointWebSocketUploaders = endpointWebSocket + "/uploaders";

export {endpointApi, endpointPlaylists, endpointVideos, endpointWebSocket, endpointWebSocketPlaylists, endpointWebSocketVideos,
    endpointUploadersAvatar, endpointUploaders, endpointWebSocketUploaders
 };