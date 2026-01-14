import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import Dashboard from "@/react-app/pages/Dashboard";
import TeacherRegistrationForm from "@/react-app/components/TeacherRegistrationForm";
import PlanningSummary from "@/react-app/pages/PlanningSummary";
import CreateDailyPlanning from "@/react-app/pages/CreateDailyPlanning";
import MyAccount from "@/react-app/pages/MyAccount";
import UnitWizard from "@/react-app/components/UnitWizard";
import ConfigurationWizard from "@/react-app/components/ConfigurationWizard";
import DailyPlanningEditChat from "@/react-app/pages/DailyPlanningEditChat";
import DeleteDailyPlanningConfirmation from "@/react-app/pages/DeleteDailyPlanningConfirmation";
import UnitPlanningEditChat from "@/react-app/pages/UnitPlanningEditChat";
import DeleteUnitPlanningConfirmation from "@/react-app/pages/DeleteUnitPlanningConfirmation";
import UnitPlanningDetails from "@/react-app/pages/UnitPlanningDetails";
import DailyPlanningDetails from "@/react-app/pages/DailyPlanningDetails";
import { PlanningProvider } from "@/react-app/context/PlanningContext";

export default function App() {
  return (
    <PlanningProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registro" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/teacher-registration" element={<TeacherRegistrationForm />} />
          <Route path="/resumen-planificacion" element={<PlanningSummary />} />
          <Route path="/crear-planificacion" element={<CreateDailyPlanning />} />
          <Route path="/crear-planificacion-diaria/:activityName" element={<DailyPlanningDetails />} />
          <Route path="/mi-cuenta" element={<MyAccount />} />
          <Route path="/create/unit" element={
            <UnitWizard 
              userEmail={localStorage.getItem('userEmail') || ''} 
              onSuccess={() => window.location.href = '/resumen-planificacion'}
              onCancel={() => window.location.href = '/resumen-planificacion'}
            />
          } />
          <Route path="/configuracion-inicial" element={
            <ConfigurationWizard 
              userEmail={localStorage.getItem('userEmail') || ''} 
              onSuccess={() => window.location.href = '/resumen-planificacion'}
              onCancel={() => window.location.href = '/resumen-planificacion'}
            />
          } />
          <Route 
            path="/editar-planificacion-diaria/:planningId" 
            element={<DailyPlanningEditChat />} 
          />
          <Route 
            path="/eliminar-planificacion-diaria/:planningId" 
            element={<DeleteDailyPlanningConfirmation />} 
          />
          <Route 
            path="/ver-planificacion-unidad/:planningId" 
            element={<UnitPlanningDetails />} 
          />
          <Route 
            path="/editar-planificacion-unidad/:planningId" 
            element={<UnitPlanningEditChat />} 
          />
          <Route 
            path="/eliminar-planificacion-unidad/:planningId" 
            element={<DeleteUnitPlanningConfirmation />} 
          />
        </Routes>
      </Router>
    </PlanningProvider>
  );
}
