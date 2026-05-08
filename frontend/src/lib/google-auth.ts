export const initiateGoogleLogin = (role: "candidate" | "hr") => {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  window.location.href = `${backendUrl}/api/auth/google?role=${role}`;
};