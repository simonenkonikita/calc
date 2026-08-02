// backend/src/controllers/projects.controller.ts

import { Request, Response } from "express";
import { PROJECTS_INFO } from "../data/projectInfo";


export const getProjects = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: PROJECTS_INFO,
    });
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get projects",
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = PROJECTS_INFO.find((p) => p.id === id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error getting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get project",
    });
  }
};