export const initiateGoogleLogin = (role: "candidate" | "hr") => {
  const backendUrl = "https://hireflow-backend-60ld.onrender.com"; // TODO: revert to env var after presentation
  window.location.href = `${backendUrl}/api/auth/google?role=${role}`;
};
