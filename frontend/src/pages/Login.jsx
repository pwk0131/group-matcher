import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/bookend_logo.png';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

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
                setErrorMsg(errorText || '아이디 또는 비밀번호가 틀렸습니다.');
            }
        } catch (error) {
            setErrorMsg('서버와 연결할 수 없습니다.');
        }
    };

    // ... (위의 로직은 이전과 동일) ...

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '80px' }}>
            <img src={logoImg} alt="Bookend Logo" style={{ width: '180px', marginBottom: '40px' }} />

            <div style={{ padding: '40px', border: '1px solid var(--color-border)', borderRadius: '12px', width: '320px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)'}}>
                <h2 style={{ textAlign: 'center', margin: '0 0 30px 0', fontSize: '24px' }}>운영진 로그인</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {errorMsg && <div style={{ color: '#d32f2f', fontSize: '13px', textAlign: 'center' }}>{errorMsg}</div>}

                    {/* 글로벌 포인트 버튼 사용 */}
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                        접속하기
                    </button>
                </form>
            </div>
        </div>
    );
}