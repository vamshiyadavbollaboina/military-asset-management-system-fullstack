import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Purchases from "./pages/Purchases";
import Transfers from "./pages/Transfers";
import Assignments from "./pages/Assignments";
import Expenditures from "./pages/Expenditures";
import AuditLogs from "./pages/AuditLogs";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Layout from "./components/Layout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              element={
                <RoleRoute allowedRoles={["ADMIN", "LOGISTICS_OFFICER"]} />
              }
            >
              <Route path="/purchases" element={<Purchases />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={["ADMIN", "LOGISTICS_OFFICER"]} />
              }
            >
              <Route path="/transfers" element={<Transfers />} />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={["ADMIN", "BASE_COMMANDER"]} />}
            >
              <Route path="/assignments" element={<Assignments />} />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={["ADMIN", "BASE_COMMANDER"]} />}
            >
              <Route path="/expenditures" element={<Expenditures />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
