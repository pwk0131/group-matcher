import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Members from './pages/Members';
import Formation from './pages/Formation';
import Result from './pages/Result';
import History from './pages/History';
import Footer from './components/Footer';
import './index.css';

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
    const [isChecking, setIsChecking] = useState(true);

    const [progress, setProgress] = useState(0);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        let interval;
        if (isChecking) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev < 90) return prev + (Math.random() * 0.64 + 0.4);
                    if (prev < 99) return prev + (Math.random() * 0.1 + 0.05);
                    return 99;
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isChecking]);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
                    credentials: 'include'
                });

                setProgress(100);
                await new Promise(resolve => setTimeout(resolve, 600));

                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setProgress(100);
                await new Promise(resolve => setTimeout(resolve, 600));
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false);
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
        return (
            <div className="global-loading-container">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px'}}>
                    <div className="spinner"
                         style={{width: '24px', height: '24px', borderWidth: '3px', marginBottom: 0}}></div>
                    <div className="loading-text" style={{fontSize: '20px', margin: 0}}>서버와 연결 중입니다...</div>
                </div>

                <div className="progress-wrapper">
                    <div className="progress-container">
                        <div className="progress-bar" style={{width: `${Math.min(progress, 100)}%`}}></div>
                    </div>
                    <div className="progress-text">{Math.floor(progress)}%</div>
                </div>

                <div className="loading-subtext" style={{fontSize: '15px'}}>
                    무료 서버로 배포한 사이트라 초기 연결이 느려요.😥<br/>
                    <b>1분 30초 ~ 3분 정도</b> 소요될 수 있으니 조금만 기다려주세요
                </div>

                <div className="server-explanation-box">
                    <div className="explanation-header">
                        <span style={{fontSize: '16px'}}>💡</span>
                        <div className="explanation-title">초기 연결이 지연되는 이유</div>
                    </div>
                    <div className="explanation-desc">
                        장기간 방문자가 없으면 무료 서버가 자원을 절약하기 위해 <b>수면 모드</b>로 전환됩니다.<br/><br/>
                        현재 요청을 받고 <b>서버가 다시 작업을 준비하는 중</b>이므로 약간의 대기 시간이 발생합니다.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            {isAuthenticated && (
                <header style={{borderBottom: '1px solid var(--color-border)'}}>
                    <div style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        padding: '15px 20px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>Bookend</span>
                        <NavLink to="/members" style={navLinkStyle}>회원 관리</NavLink>
                        <NavLink to="/history" style={navLinkStyle}>조 편성 기록</NavLink>
                        <NavLink to="/formation" style={navLinkStyle}>새 조 편성</NavLink>
                        <div style={{ marginLeft: 'auto' }}>
                            <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px' }}>로그아웃</button>
                        </div>
                    </div>
                </header>
            )}

            <main style={{ flexGrow: 1}}>
                <Routes>
                    <Route path="/" element={
                        isAuthenticated ? <Navigate to="/members" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                    } />
                    <Route path="/members" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Members /></ProtectedRoute>} />
                    <Route path="/formation" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Formation /></ProtectedRoute>} />
                    <Route path="/result" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Result /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute isAuthenticated={isAuthenticated}><History /></ProtectedRoute>} />
                </Routes>
            </main>

            <Footer />
        </BrowserRouter>
    );
}

export default App;