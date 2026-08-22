import { Routes, Route } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import MortgageCalculator from "../../pages/MortgageCalculator/MortgageCalculator";
import { ProjectsPage } from "../../pages/ProjectsPage/ProjectsPage";
import { MortgageProgramsPage } from "../../pages/ProgramPage/MortgageProgramsPage";
import { AdminPage } from "../../pages/Admin/AdminPage";

const App = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/calculator" element={<MortgageCalculator />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/mortgage-programs" element={<MortgageProgramsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
};

export default App;
