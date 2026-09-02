import { useState } from 'react';

export default function SettingsModal({ onClose, onLogout }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (newPassword !== confirmPassword) {
            return setErrorMsg('새 비밀번호가 일치하지 않습니다.');
        }
        if (!newUsername || !newPassword) {
            return setErrorMsg('모든 칸을 입력해주세요.');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newUsername, newPassword })
            });

            if (response.ok) {
                alert("정보가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
                onClose();
                onLogout();
            } else {
                const text = await response.text();
                setErrorMsg(text || "변경에 실패했습니다.");
            }
        } catch (error) {
            setErrorMsg("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ marginTop: 0, color: 'var(--color-accent-dark)' }}>설정</h3>

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>본인 확인</div>
                    <input type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

                    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '10px 0' }} />

                    <div style={{ fontSize: '12px', color: '#666' }}>변경할 정보</div>
                    <input type="text" placeholder="새로운 아이디" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
                    <input type="password" placeholder="새로운 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <input type="password" placeholder="새로운 비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                    {errorMsg && <div style={{ color: '#d32f2f', fontSize: '13px', textAlign: 'center', marginTop: '5px' }}>{errorMsg}</div>}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>취소</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>변경하기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}