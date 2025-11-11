const isLive = true;  

const CONFIG = {
  API_BASE_URL: isLive
    ? "https://online-garage-api-2.onrender.com"
    : "http://localhost:5000",
};

export default CONFIG;