import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Members from './pages/Members';
import Formation from './pages/Formation';
import Result from './pages/Result';
import './index.css'; // 글로벌 CSS 적용

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
};

// 활성화된 메뉴에 포인트를 주기 위한 스타일 함수
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
    const isLoggedIn = !!localStorage.getItem('isAuthenticated');

    return (
        <BrowserRouter>
            {isLoggedIn && (
                <header style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>📚 Bookend</span>
                        <NavLink to="/members" style={navLinkStyle}>부원 관리</NavLink>
                        <NavLink to="/formation" style={navLinkStyle}>조 편성 세팅</NavLink>
                        <NavLink to="/result" style={navLinkStyle}>결과 및 튜닝</NavLink>
                    </div>
                </header>
            )}

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                <Route path="/formation" element={<ProtectedRoute><Formation /></ProtectedRoute>} />
                <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;