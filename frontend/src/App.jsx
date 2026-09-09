import { useState } from "react";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Registrations from "./pages/Registrations";
import Queues from "./pages/queues";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const [page, setPage] = useState("dashboard");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setPage("dashboard");
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (page === "patients") {
    return <Patients onBack={() => setPage("dashboard")} onLogout={logout} />;
  }

  if (page === "registrations") {
    return (
      <Registrations onBack={() => setPage("dashboard")} onLogout={logout} />
    );
  }

  if (page === "queues") {
    return <Queues onBack={() => setPage("dashboard")} onLogout={logout} />;
  }

  if (page === "medical-records") {
    return (
      <MedicalRecords onBack={() => setPage("dashboard")} onLogout={logout} />
    );
  }

  if (page === "prescriptions") {
    return (
      <Prescriptions onBack={() => setPage("dashboard")} onLogout={logout} />
    );
  }

  return (
    <Dashboard
      onLogout={logout}
      onPatients={() => setPage("patients")}
      onRegistrations={() => setPage("registrations")}
      onQueues={() => setPage("queues")}
      onMedicalRecords={() => setPage("medical-records")}
      onPrescriptions={() => setPage("prescriptions")}
    />
  );
}

export default App;
