// src/services/_test.js
import api from "./api";

api.get("/health")
  .then(res => console.log("API OK:", res.data))
  .catch(err => console.error("API FAIL:", err));
