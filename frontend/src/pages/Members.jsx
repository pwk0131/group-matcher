import { useState, useEffect } from 'react';
import './Members.css'; // 💡 분리된 CSS 파일 불러오기

export default function Members() {
    const [members, setMembers] = useState([]);
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('NEW');

    // 1. 부원 목록 불러오기 (백엔드 연동 전이라 가짜 데이터로 UI 먼저 확인)
    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            // TODO: 백엔드 API (GET /api/members) 호출 예정
            // const response = await fetch('http://localhost:8080/api/members', { credentials: 'include' });
            // const data = await response.json();

            // 당장 화면을 보기 위한 임시 데이터 세팅
            setMembers([
                { memberId: 1, name: '단비', roleType: 'EXISTING', attendanceCount: 2, isFacilitator: false, isActive: true },
                { memberId: 2, name: '민곤', roleType: 'EXISTING', attendanceCount: 1, isFacilitator: true, isActive: true },
                { memberId: 3, name: '새부원', roleType: 'NEW', attendanceCount: 0, isFacilitator: false, isActive: true },
            ]);
        } catch (error) {
            console.error("데이터를 불러오지 못했습니다.", error);
        }
    };

    // 2. 신규 부원 추가
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return alert("이름을 입력해주세요.");

        const newMemberData = {
            name: newName,
            roleType: newRole,
            attendanceCount: 0,
            isFacilitator: false,
            isActive: true
        };

        // TODO: 백엔드 API (POST /api/members) 호출 예정
        // 임시로 프론트엔드 화면에만 즉시 추가되도록 처리
        setMembers([...members, { memberId: Date.now(), ...newMemberData }]);
        setNewName(''); // 입력창 초기화
    };

    // 3. 부원 설정 변경 (출석, 진행자 여부, 활성 상태 등)
    const handleUpdate = async (id, field, value) => {
        // 프론트 화면 즉시 업데이트 (Optimistic UI)
        setMembers(members.map(m => m.memberId === id ? { ...m, [field]: value } : m));

        // TODO: 백엔드 API (PATCH 또는 PUT /api/members/{id}) 호출하여 DB에 반영
    };

    // 4. 부원 삭제 (완전 삭제)
    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} 부원을 정말 삭제하시겠습니까? (이력도 모두 날아갑니다)`)) return;

        // 프론트 화면 즉시 업데이트
        setMembers(members.filter(m => m.memberId !== id));

        // TODO: 백엔드 API (DELETE /api/members/{id}) 호출하여 DB에서 삭제
    };

    return (
        <div className="page-container">
            <div className="members-top-bar">
                <h2 className="page-title" style={{ margin: 0, border: 'none' }}>대시보드</h2>
                <span style={{ fontSize: '15px', color: '#666' }}>활동 중: <b>{members.filter(m => m.isActive).length}</b>명</span>
            </div>

            {/* 부원 추가 폼 */}
            <form className="add-member-area" onSubmit={handleAddMember}>
                <input
                    type="text"
                    placeholder="새로운 부원 이름..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="NEW">🌱 신입 (NEW)</option>
                    <option value="EXISTING">🌳 기존 (EXISTING)</option>
                </select>
                <button type="submit" className="btn-primary">추가하기</button>
            </form>

            {/* 부원 목록 테이블 */}
            <table className="members-table">
                <thead>
                <tr>
                    <th>이름</th>
                    <th>구분</th>
                    <th>출석 횟수</th>
                    <th>진행자 여부</th>
                    <th>활동 상태</th>
                    <th>관리</th>
                </tr>
                </thead>
                <tbody>
                {members.map(member => (
                    <tr key={member.memberId} style={{ opacity: member.isActive ? 1 : 0.5 }}>
                        <td style={{ fontWeight: 'bold' }}>{member.name}</td>

                        <td>
                            <select
                                value={member.roleType}
                                onChange={(e) => handleUpdate(member.memberId, 'roleType', e.target.value)}
                                style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
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
                                checked={member.isActive}
                                onChange={(e) => handleUpdate(member.memberId, 'isActive', e.target.checked)}
                            />
                        </td>

                        {/* ... */}
                        <td>
                            <button className="btn-outline" onClick={() => handleDelete(member.memberId, member.name)}>
                                삭제
                            </button>
                        </td>
                        {/* ... */}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}