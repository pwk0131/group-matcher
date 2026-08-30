import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Members from './pages/Members';
import Formation from './pages/Formation';
import Result from './pages/Result';
import History from './pages/History';
import Footer from './components/Footer';
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
    const [isChecking, setIsChecking] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        return (
            <div className="global-loading-container">
                <div className="spinner"></div>
                <div className="loading-text" style={{ fontSize: '20px' }}>서버와 연결 중입니다...</div>
                <div className="loading-subtext" style={{ fontSize: '15px' }}>
                    무료 서버로 배포한 사이트라 초기 연결이 많이 느려요.<br/>
                    <b>최대 3분 정도</b> 소요될 수 있으니 창을 닫지 말고 조금만 기다려주세요
                </div>

                <div className="server-explanation-box">
                    <div className="explanation-title">
                        <span>🤔</span> 왜 이렇게 오래 걸리나요?
                    </div>

                    {/* 그림 (이모지 다이어그램) */}
                    <div className="server-sleep-diagram">
                        <div className="diagram-step">
                            <span className="diagram-icon">💤</span>
                            <span className="diagram-label">서버 깊은 잠</span>
                        </div>
                        <div className="diagram-arrow">▶</div>
                        <div className="diagram-step">
                            <span className="diagram-icon waking-clock">⏰</span>
                            <span className="diagram-label">기상 및 준비</span>
                        </div>
                        <div className="diagram-arrow">▶</div>
                        <div className="diagram-step">
                            <span className="diagram-icon">🚀</span>
                            <span className="diagram-label">연결 완료!</span>
                        </div>
                    </div>

                    <div className="explanation-desc">
                        오랫동안 방문자가 없으면 서버가 에너지를 절약하기 위해 <b>'수면 모드'</b>에 들어갑니다.<br/>
                        지금 여러분의 접속 요청을 받고 <b>서버가 다시 잠에서 깨어나 일할 준비를 하는 중</b>이라 시간이 조금 걸리고 있어요
                    </div>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            {/* 1. 헤더 영역 (상단 고정) */}
            {isAuthenticated && (
                <header style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '15px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
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

            {/* 2. 메인 컨텐츠 영역 (flexGrow: 1을 주어 빈 공간을 모두 차지하게 함) */}
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

            {/* 3. 푸터 영역 (항상 맨 아래에 위치하게 됨) */}
            <Footer />
        </BrowserRouter>
    );
}

export default App;