const isLive = false;  // change to true for live deployment

const CONFIG = {
  API_BASE_URL: isLive
    ? "https://online-garage-api-2.onrender.com"
    : "http://localhost:5000",
};

export default CONFIG;
