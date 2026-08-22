// src/pages/ProjectsPage/utils/projectHelpers.ts
export const getStatusClass = (status: string) => {
  switch (status) {
    case "сдан":
      return "status-sdan";
    case "строится":
      return "status-stroitsya";
    default:
      return "status-proekt";
  }
};

export const getStatusDotClass = (status: string) => {
  switch (status) {
    case "сдан":
      return "dot-sdan";
    case "строится":
      return "dot-stroitsya";
    default:
      return "dot-proekt";
  }
};

export const PROGRAM_ORDER = [
  "base",
  "tranche",
  "full",
  "short",
  "family",
  "it",
];

export const sortProgramTypes = (types: string[]) => {
  return types.sort((a, b) => {
    const indexA = PROGRAM_ORDER.indexOf(a);
    const indexB = PROGRAM_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};
