import { Routes, Route } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import MortgageCalculator from "../../pages/MortgageCalculator";
import { ProjectsPage } from "../../pages/ProjectsPage/ProjectsPage";

const App = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/calculator" element={<MortgageCalculator />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </>
  );
};

export default App;
