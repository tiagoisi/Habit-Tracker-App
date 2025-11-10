import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import Landing from '@pages/Landing/Landing';
import Login from '@pages/Login/Login';
import Register from '@pages/Register/Register';
import Dashboard from '@pages/Dashboard/Dashboard';
import Achievements from '@pages/Achievements/Achievements';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para redirigir usuarios autenticados
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/achievements"
                element={
                    <PrivateRoute>
                        <Achievements />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
             <BrowserRouter>
            {/* ✅ Agregar el Toaster global */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    // Estilos por defecto
                    duration: 4000,
                    style: {
                        background: 'rgba(23, 23, 23, 0.95)',
                        color: '#e2e8f0',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '0.75rem',
                        padding: '16px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    },
                    // Estilos específicos por tipo
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid rgba(16, 185, 129, 0.5)',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                        },
                    },
                    loading: {
                        style: {
                            border: '1px solid rgba(148, 163, 184, 0.5)',
                        },
                    },
                }}
            />
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;