import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { TeamProvider } from './store/TeamContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import TeamDashboard from './components/Team/TeamDashboard';
import TeamView from './components/Team/TeamView';
import BoardPage from './components/Board/BoardPage';
import Header from './components/Layout/Header';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Teams Dashboard */}
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamProvider>
                    <Header />
                    <TeamDashboard />
                  </TeamProvider>
                </ProtectedRoute>
              }
            />

            {/* Team View — boards list + members */}
            <Route
              path="/team/:teamId"
              element={
                <ProtectedRoute>
                  <TeamProvider>
                    <Header />
                    <TeamView />
                  </TeamProvider>
                </ProtectedRoute>
              }
            />

            {/* Board View — Kanban board */}
            <Route
              path="/team/:teamId/board/:boardId"
              element={
                <ProtectedRoute>
                  <TeamProvider>
                    <BoardPage />
                  </TeamProvider>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/teams" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
