import { BrowserRouter, Routes, Route } from "react-router-dom";
import SkillSetup from "./components/SkillSetup";
import ProjectBrief from "./components/ProjectBrief";
import CodeSubmission from "./components/CodeSubmission";
import ReviewResult from "./components/ReviewResult";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SkillSetup />} />
        <Route path="/project-brief" element={<ProjectBrief />} />
        <Route path="/submit" element={<CodeSubmission />} />
        <Route path="/review" element={<ReviewResult />} />
      </Routes>
    </BrowserRouter>
  );
}
