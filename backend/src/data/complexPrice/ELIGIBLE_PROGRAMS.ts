// src/data/complexPrice/ELIGIBLE_PROGRAMS.ts

import { ProgramInfo } from "../../types/types";
import { getProgramsForComplex } from "../../utils/programHelpers";
import { COMPLEX_NAMES } from "./CONSTRUCTION";

export const ELIGIBLE_PROGRAMS: Record<string, ProgramInfo[]> = {
  [COMPLEX_NAMES.SADY_3]: getProgramsForComplex(COMPLEX_NAMES.SADY_3),
  [COMPLEX_NAMES.SADY_2]: getProgramsForComplex(COMPLEX_NAMES.SADY_2),
  [COMPLEX_NAMES.LERMONTOV]: getProgramsForComplex(COMPLEX_NAMES.LERMONTOV),
  [COMPLEX_NAMES.GORY_ZDES]: getProgramsForComplex(COMPLEX_NAMES.GORY_ZDES),
  [COMPLEX_NAMES.DVA_ADMIRALA]: getProgramsForComplex(
    COMPLEX_NAMES.DVA_ADMIRALA,
  ),
  [COMPLEX_NAMES.MORE_TUT]: getProgramsForComplex(COMPLEX_NAMES.MORE_TUT),
  [COMPLEX_NAMES.MORELLO]: getProgramsForComplex(COMPLEX_NAMES.MORELLO),
  [COMPLEX_NAMES.SOLAR]: getProgramsForComplex(COMPLEX_NAMES.SOLAR),
};
