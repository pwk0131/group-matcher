import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/bookend_logo.png'; // 로고 이미지 불러오기

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // 로그인 시도 시 기존 에러 메시지 초기화

        try {
            // 💡 진짜 백엔드 로그인 API와 통신!
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // JSON 형태로 데이터를 보낸다고 명시
                },
                // 아이디와 비밀번호를 JSON 문자열로 변환하여 전송
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {

                const data = await response.json();
                localStorage.setItem('adminToken', data.token);
                navigate('/members');
                window.location.reload();
            } else {
                const errorText = await response.text();
                setErrorMsg(errorText || '아이디 또는 비밀번호가 틀렸습니다.');
            }
        } catch (error) {
            setErrorMsg('서버와 연결할 수 없습니다.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
            {/* 로고 이미지 표시 */}
            <img src={logoImg} alt="Bookend Logo" style={{ width: '200px', marginBottom: '30px' }} />

            <div style={{ padding: '40px', border: '1px solid #ddd', borderRadius: '10px', width: '300px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>운영진 로그인</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px' }}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px' }}
                    />

                    {errorMsg && <div style={{ color: 'red', fontSize: '14px', textAlign: 'center', wordBreak: 'keep-all' }}>{errorMsg}</div>}

                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            backgroundColor: '#aa3bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        접속하기
                    </button>
                </form>
            </div>
        </div>
    );
}