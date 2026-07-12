import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import MortgageCalculator from "./pages/MortgageCalculator";
import { ProjectsPage } from "./pages/ProjectsPage/ProjectsPage";

const Home = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Добро пожаловать!</h1>
      <p>Это приложение для расчёта ипотеки</p>
    </div>
  );
};

const Results = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Результаты расчётов</h1>
      <p>Здесь будут отображаться сохранённые расчёты</p>
    </div>
  );
};

const App = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<MortgageCalculator />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </>
  );
};

export default App;
