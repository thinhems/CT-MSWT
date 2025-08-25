import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Rooms from "../pages/Rooms";
import Shifts from "../pages/Shifts";
import Buildings from "../pages/Buildings";
import UserManagement from "../pages/UserManagement";
import ReportManagement from "../pages/ReportManagement";
import TrashBinList from "../pages/TrashBinList";
import NotFound from "../pages/NotFound";
import Notifications from "../pages/Notifications";
import Areas from "../pages/Areas";
import Schedules from "../pages/Schedules";
import AssignmentManagement from "../pages/AssignmentManagement";
import Leaves from "../pages/Leaves";
import Attendance from "../pages/Attendance";
import RequestManagement from "../pages/RequestManagement";
import GroupManagement from "../pages/GroupManagement";
import GroupAssignment from "../pages/GroupAssignment";
import WorkerGroupManagement from "../pages/WorkerGroupManagement";

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
        path: "rooms",
        element: <Rooms />,
      },
      {
        path: "shifts",
        element: <Shifts />,
      },
      {
        path: "buildings",
        element: <Buildings />,
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
        path: "leaves",
        element: <Leaves />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "request-management",
        element: <RequestManagement />,
      },
      {
        path: "group-management",
        element: <GroupManagement />,
      },
      {
        path: "group-assignment",
        element: <GroupAssignment />,
      },
      {
        path: "worker-group-management",
        element: <WorkerGroupManagement />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
