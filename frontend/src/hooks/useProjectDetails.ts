// src/pages/ProjectsPage/hooks/useProjectDetails.ts
import { useState, useMemo } from "react";

import { sortProgramTypes } from "../utils/projectHelpers";
import { ProjectInfo } from "../utils/types";

export const useProjectDetails = (project: ProjectInfo | null) => {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const groupedByProgram = useMemo(() => {
    if (!project?.eligiblePrograms) return {};
    const grouped: Record<string, any> = {};
    project.eligiblePrograms.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        grouped[program.type] = program;
      }
    });
    return grouped;
  }, [project]);

  const sortedProgramTypes = useMemo(() => {
    return sortProgramTypes(Object.keys(groupedByProgram));
  }, [groupedByProgram]);

  return {
    groupedByProgram,
    sortedProgramTypes,
    expandedProgram,
    setExpandedProgram,
  };
};
