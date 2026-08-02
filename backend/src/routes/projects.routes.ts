
import { Router } from "express";
import { getProjects, getProjectById } from "../controllers/projects.controller";

const router = Router();

router.get("/", getProjects);
router.get("/:id", getProjectById);

export { router as projectsRoutes };