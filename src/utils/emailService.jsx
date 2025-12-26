import emailjs from "@emailjs/browser";

export const sendPatientCredentials = async ({
  patientName,
  patientEmail,
  tempPassword,
}) => {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      patient_name: patientName,
      patient_email: patientEmail,
      temp_password: tempPassword,
      login_link: "http://localhost:5173/login",
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};
