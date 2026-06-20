export const logout = (navigate) => {
  localStorage.clear(); // remove all saved login data
  navigate("/login");   // go back to login page
};