import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Members from './pages/Members';
import Formation from './pages/Formation';
import Result from './pages/Result';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

function App() {
    const isLoggedIn = !!localStorage.getItem('isAuthenticated');

    return (
        <BrowserRouter>
            {isLoggedIn && (
                <nav style={{ padding: '20px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                    <Link to="/members" style={{ marginRight: '15px' }}>부원 관리</Link>
                    <Link to="/formation" style={{ marginRight: '15px' }}>조 편성 로딩</Link>
                    <Link to="/result">결과 및 튜닝</Link>
                </nav>
            )}

            <div style={{ padding: '20px' }}>
                <Routes>
                    {/* 로그인 페이지는 누구나 접근 가능 */}
                    <Route path="/" element={<Login />} />

                    <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                    <Route path="/formation" element={<ProtectedRoute><Formation /></ProtectedRoute>} />
                    <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;