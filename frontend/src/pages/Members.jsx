import { useState, useEffect } from 'react';
import './Members.css';

export default function Members() {
    const [members, setMembers] = useState([]);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('NEW');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (error) {
            console.error("데이터를 불러오지 못했습니다.", error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return alert("이름을 입력해주세요.");

        const newMemberData = {
            name: newName,
            roleType: newRole,
            attendanceCount: 0,
            isFacilitator: false,
            isInactive: false // 💡 기본값은 활동중(비활동=false)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newMemberData)
            });

            if (response.ok) {
                const savedMember = await response.json();
                setMembers([...members, savedMember]);
                setNewName('');
            }
        } catch (error) {
            alert("부원 추가에 실패했습니다.");
        }
    };

    const handleUpdate = async (id, field, value) => {
        setMembers(members.map(m => m.memberId === id ? { ...m, [field]: value } : m));

        try {
            await fetch(`${API_BASE_URL}/api/members/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ field, value })
            });
        } catch (error) {
            console.error("업데이트 실패");
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} 부원을 정말 삭제하시겠습니까? (과거 조 편성 이력도 모두 날아갑니다)`)) return;

        setMembers(members.filter(m => m.memberId !== id));

        try {
            await fetch(`${API_BASE_URL}/api/members/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
        } catch (error) {
            console.error("삭제 실패");
        }
    };

    return (
        <div className="page-container">
            <div className="members-top-bar">
                <h2 className="page-title" style={{ margin: 0, border: 'none' }}>대시보드</h2>
                {/* isInactive가 false인 사람만 활동 중인 것으로 카운트 */}
                <span style={{ fontSize: '15px', color: '#666' }}>활동 중: <b>{members.filter(m => !m.isInactive).length}</b>명</span>
            </div>

            <form className="add-member-area" onSubmit={handleAddMember}>
                <input
                    type="text"
                    placeholder="새로운 부원 이름..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="NEW">신입 (NEW)</option>
                    <option value="EXISTING">기존 (EXISTING)</option>
                </select>
                <button type="submit" className="btn-primary">추가하기</button>
            </form>

            <table className="members-table">
                <thead>
                <tr>
                    <th>이름</th>
                    <th>구분</th>
                    <th>출석 횟수</th>
                    <th>진행자 여부</th>
                    <th>비활동 여부</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {members.map(member => (
                    <tr
                        key={member.memberId}
                        className={member.roleType === 'NEW' ? 'new-member' : ''}
                        style={{ opacity: member.isInactive ? 0.4 : 1 }}
                    >
                        <td style={{ fontWeight: 'bold' }}>{member.name}</td>

                        <td>
                            <select
                                value={member.roleType}
                                onChange={(e) => handleUpdate(member.memberId, 'roleType', e.target.value)}
                                style={{ padding: '4px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                            >
                                <option value="NEW">신입</option>
                                <option value="EXISTING">기존</option>
                            </select>
                        </td>

                        <td>
                            <div className="attendance-control">
                                <button onClick={() => handleUpdate(member.memberId, 'attendanceCount', Math.max(0, member.attendanceCount - 1))}>-</button>
                                <span style={{ width: '20px' }}>{member.attendanceCount}</span>
                                <button onClick={() => handleUpdate(member.memberId, 'attendanceCount', member.attendanceCount + 1)}>+</button>
                            </div>
                        </td>

                        <td>
                            <input
                                type="checkbox"
                                checked={member.isFacilitator}
                                onChange={(e) => handleUpdate(member.memberId, 'isFacilitator', e.target.checked)}
                            />
                        </td>

                        <td>
                            <input
                                type="checkbox"
                                checked={member.isInactive}
                                onChange={(e) => handleUpdate(member.memberId, 'isInactive', e.target.checked)}
                            />
                        </td>

                        <td>
                            <button className="btn-outline" onClick={() => handleDelete(member.memberId, member.name)}>
                                삭제
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}