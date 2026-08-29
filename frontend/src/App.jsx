import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Members from './pages/Members';
import Formation from './pages/Formation';
import Result from './pages/Result';
import History from './pages/History';
import './index.css';

// ProtectedRoute가 이제 로컬스토리지가 아닌 부모의 state를 받습니다.
const ProtectedRoute = ({ children, isAuthenticated }) => {
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
};

const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '10px 15px',
    color: isActive ? '#ffffff' : 'var(--color-text)',
    backgroundColor: isActive ? 'var(--color-accent-dark)' : 'transparent',
    borderRadius: '6px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s',
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true); // 처음에 로그인 상태를 확인 중인지 여부

    // 환경변수 (Vercel 프록시를 쓰신다면 빈 문자열이어도 상관없습니다)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // 앱이 처음 켜질 때 백엔드에 쿠키가 유효한지 물어봅니다.
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false); // 확인 끝
            }
        };
        checkLoginStatus();
    }, [API_BASE_URL]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch(e) {}
        setIsAuthenticated(false);
    };

    if (isChecking) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>로그인 상태 확인 중...</div>;
    }

    return (
        <BrowserRouter>
            {isAuthenticated && (
                <header style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>Bookend</span>
                        <NavLink to="/members" style={navLinkStyle}>부원 관리</NavLink>
                        <NavLink to="/history" style={navLinkStyle}>역대 조 편성</NavLink>
                        <NavLink to="/formation" style={navLinkStyle}>새 조 편성</NavLink>
                        <div style={{ marginLeft: 'auto' }}>
                            <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px' }}>로그아웃</button>
                        </div>
                    </div>
                </header>
            )}
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? <Navigate to="/members" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                } />

                <Route path="/members" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Members /></ProtectedRoute>} />
                <Route path="/formation" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Formation /></ProtectedRoute>} />
                <Route path="/result" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Result /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute isAuthenticated={isAuthenticated}><History /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;