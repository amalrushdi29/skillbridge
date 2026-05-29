import axios from "axios";

const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:5001";

export const predictEmployability = async (skills, jobType = "full-time") => {
  const response = await axios.post(`${ML_API_URL}/predict`, {
    skills,
    jobType,
  });
  return response.data;
};

export const getTopSkills = async () => {
  const response = await axios.get(`${ML_API_URL}/top-skills`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(`${ML_API_URL}/health`);
  return response.data;
};