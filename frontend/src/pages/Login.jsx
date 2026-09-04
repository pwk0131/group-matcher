import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/bookend_logo.png';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // 탭 제목 설정
    useEffect(() => {
        document.title = "Bookend Weaver/login";
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                onLoginSuccess();
                navigate('/members');
            } else {
                const errorText = await response.text();
                setErrorMsg(errorText || '로그인에 실패했습니다.');
                setIsLoading(false);
            }
        } catch (error) {
            setErrorMsg('서버와 연결할 수 없습니다.');
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <img src={logoImg} alt="Bookend Weaver Logo" style={{ width: '150px', marginBottom: '25px' }} />

            <div className="login-card">
                <h2 className="login-title">Bookend Weaver</h2>
                <div className="login-subtitle">
                    북엔드의 소중한 인연을 엮어내는 곳,<br/>
                    관리자 계정으로 로그인해 주세요.
                </div>

                <form onSubmit={handleLogin}>
                    <div className="login-input-group">
                        <input
                            type="text"
                            placeholder="아이디"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {errorMsg && (
                        <div style={{color: '#d32f2f', fontSize: '13.5px', marginBottom: '16px', fontWeight: 'bold'}}>
                            {errorMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                                <span className="btn-spinner"></span>
                                로그인 중...
                            </div>
                        ) : (
                            '접속하기'
                        )}
                    </button>

                    <div className="mobile-warning-box">
                        <div style={{
                            fontSize: '13.5px',
                            color: 'var(--color-accent-dark)',
                            fontWeight: 'bold',
                            marginBottom: '6px'
                        }}>
                            📱 접속 환경 안내
                        </div>
                        본 대시보드는 <b>PC(데스크톱/노트북) 환경</b>에 최적화된 관리툴입니다.<br/>
                        모바일 기기로 접속 시 레이아웃 깨짐이 발생할 수 있으니 가급적 PC 사용을 권장합니다.
                    </div>

                </form>
            </div>
        </div>
    );
}