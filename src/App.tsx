import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { BoardProvider } from './store/BoardContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Board from './components/Board/Board';
import Header from './components/Layout/Header';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <BoardProvider>
                    <Header />
                    <Board />
                  </BoardProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/board" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
