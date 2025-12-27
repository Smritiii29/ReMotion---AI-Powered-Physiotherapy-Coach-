// src/routes/patientRouter.js
import { Router } from "express";
import { db } from "../config/firebaseAdmin.js"; // Now imports correctly

const patientRouter = Router();

patientRouter.get("/", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("Users").get();

    if (usersSnapshot.empty) {
      return res.status(200).json({ message: "No patients found", patients: [] });
    }

    const patients = [];
    usersSnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      message: "Patients fetched successfully",
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients", details: error.message });
  }
});

export default patientRouter;