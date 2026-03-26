import { Navigate, Route, Routes } from "react-router-dom";
import { AssessmentsHubPage } from "./pages/AssessmentsHubPage";
import { ComponentsAssessmentPage } from "./pages/ComponentsAssessmentPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { LearningAssessmentPage } from "./pages/LearningAssessmentPage";
import { LearningPage } from "./pages/LearningPage";
import { ProjectPage } from "./pages/ProjectPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectPage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/learning/assessment" element={<LearningAssessmentPage />} />
      <Route path="/components" element={<ComponentsPage />} />
      <Route path="/components/assessment" element={<ComponentsAssessmentPage />} />
      <Route path="/assessments" element={<AssessmentsHubPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
