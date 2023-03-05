import express from "express";
import {
  contact,
  getDashboardStats,
  requestCourse,
} from "../controllers/otherController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/auth.js";
const router = express.Router();

router.route("/contact").post(contact);
router.route("/requestcourse").post(requestCourse);

//get admin dashboard stats
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getDashboardStats);

export default router;
