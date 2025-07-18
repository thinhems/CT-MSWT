import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Restrooms from "../pages/Restrooms";
import Shifts from "../pages/Shifts";
import Floors from "../pages/Floors";
import UserManagement from "../pages/UserManagement";
import ReportManagement from "../pages/ReportManagement";
import TrashBinList from "../pages/TrashBinList";
import NotFound from "../pages/NotFound";
import Notifications from "../pages/Notifications";
import Areas from "../pages/Areas";
import Schedules from "../pages/Schedules";
import AssignmentManagement from "../pages/AssignmentManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "restrooms",
        element: <Restrooms />,
      },
      {
        path: "shifts",
        element: <Shifts />,
      },
      {
        path: "floors",
        element: <Floors />,
      },
      {
        path: "trash",
        element: <TrashBinList />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "user-management",
        element: <UserManagement />,
      },
      {
        path: "report-management",
        element: <ReportManagement />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "areas",
        element: <Areas />,
      },
      {
        path: "schedules",
        element: <Schedules />,
      },
      {
        path: "assignments",
        element: <AssignmentManagement />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
