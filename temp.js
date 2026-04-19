import axios from "axios";

const URL = "http://localhost:3000/api/user/auth/login";
const TOTAL_REQUESTS = 5;

const payload = {
  email: "neeteshparihar2212@gmail.com",
  password: "12345678",
};

const sendRequest = async (i) => {
  try {
    const res = await axios.post(URL, payload);
    const remaining = res.headers["x-rate-limit-remaining"] || "N/A";
    const reset = res.headers["x-rate-limit-reset"] || "N/A";
    console.log(`[${i}] ✅ ${res.status} | Remaining: ${remaining} | Reset: ${reset}s`);
  } catch (err) {
    if (err.response) {
      const remaining = err.response.headers["x-rate-limit-remaining"] || "N/A";
      const reset = err.response.headers["x-rate-limit-reset"] || "N/A";
      console.log(`[${i}] ❌ ${err.response.status} - ${err.response.data.message} | Remaining: ${remaining} | Reset: ${reset}s`);
    } else {
      console.log(`[${i}] ❌ Network Error: ${err.message}`);
    }
  }
};

const flood = async () => {
  console.log(`🚀 Sending ${TOTAL_REQUESTS} requests to ${URL}\n`);

  const promises = [];
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    promises.push(sendRequest(i));
  }

  await Promise.all(promises);
  console.log("\n✅ Flood test complete!");
};

flood();
