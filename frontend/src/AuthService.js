//AuthService.js
import axios from 'axios';

export async function login(username, password, module) {
  const apiBase = `https://${module}api.nagarkaryavalinew.com`;
  const res = await axios.post(`${apiBase}/api/login`, {  username,password, }, { withCredentials: true });
  return res.data;
}

export async function getUserInfo(module) {
  const apiBase = `https://${module}api.nagarkaryavalinew.com`;
  try {
    const res = await axios.get(`${apiBase}/api/me`, { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
}

export async function logout(module) {
  const apiBase = `https://${module}api.nagarkaryavalinew.com`;
  await axios.post(`${apiBase}/api/logout`, {}, { withCredentials: true });
}
