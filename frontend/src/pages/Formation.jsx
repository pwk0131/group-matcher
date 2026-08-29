import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Formation.css';

export default function Formation() {
    const [members, setMembers] = useState([]);
    const [attendeeIds, setAttendeeIds] = useState(new Set());
    const [currentRound, setCurrentRound] = useState(1);

    const today = new Date().toISOString().split('T')[0];
    const [meetingDate, setMeetingDate] = useState(today);

    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        fetchActiveMembers();
        fetchLatestHistory();
    }, []);

    const fetchActiveMembers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/members`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                const activeMembers = data.filter(m => m.isInactive === false);

                setMembers(activeMembers);
                setAttendeeIds(new Set());
            }
        } catch (error) {
            console.error("부원 목록 로딩 실패", error);
        }
    };

    const fetchLatestHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/history`, { credentials: 'include' });
            if (response.ok) {
                const historyData = await response.json();

                if (historyData.length > 0) {
                    const latestMeeting = historyData[0];
                    setCurrentRound(latestMeeting.roundNumber + 1);

                    const nextDate = new Date(latestMeeting.meetingDate);
                    nextDate.setDate(nextDate.getDate() + 14);
                    setMeetingDate(nextDate.toISOString().split('T')[0]);
                }
            }
        } catch (error) {
            console.error("최근 이력 로딩 실패", error);
        }
    };

    const toggleMember = (id) => {
        const newSet = new Set(attendeeIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setAttendeeIds(newSet);
    };

    const toggleAll = () => {
        if (attendeeIds.size === members.length) {
            setAttendeeIds(new Set());
        } else {
            setAttendeeIds(new Set(members.map(m => m.memberId)));
        }
    };

    const handleFormation = async () => {
        if (attendeeIds.size < 3) return alert("조 편성을 위해 최소 3명 이상이 참석해야 합니다.");
        if (!currentRound || currentRound < 0) return alert("올바른 모임 회차를 입력해 주세요.");
        if (!meetingDate) return alert("모임 날짜를 선택해 주세요.");

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/teams/form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    attendeeIds: Array.from(attendeeIds),
                    currentRound: parseInt(currentRound, 10)
                })
            });

            if (response.ok) {
                const resultData = await response.json();
                // 💡 백엔드가 예전 버전을 돌려 배열을 줄 경우를 방어하는 안전장치
                const finalTeams = Array.isArray(resultData) ? resultData : resultData.teams;
                const finalLogs = Array.isArray(resultData) ? [] : resultData.logs;

                navigate('/result', { state: { teams: finalTeams, logs: finalLogs, currentRound, meetingDate } });
            } else {
                alert("조 편성 중 서버 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("통신 에러 상세:", error);
            alert("서버와 통신할 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchQuery.trim() !== '' && filteredMembers.length > 0) {
                toggleMember(filteredMembers[0].memberId);
                setSearchQuery('');
            }
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">조 편성 세팅</h2>

            <div className="formation-settings" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="setting-group">
                            <label>이번 모임 회차:</label>
                            <input
                                type="number"
                                min="0"
                                value={currentRound}
                                onChange={(e) => setCurrentRound(e.target.value)}
                            />
                            <span>{String(currentRound) === "0" ? "(OT)" : "회차"}</span>
                        </div>

                        <div className="setting-group">
                            <label>날짜:</label>
                            <input
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                style={{ width: '130px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span>참석 인원: <b style={{ color: 'var(--color-accent-dark)' }}>{attendeeIds.size}</b> / {members.length}명</span>
                        <button className="btn-outline" onClick={toggleAll}>전체 선택/해제</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="부원 이름 검색 (이름을 치고 엔터를 누르면 즉시 선택/해제됩니다)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchEnter}
                        style={{
                            flex: 1, padding: '12px 15px', fontSize: '16px',
                            border: '2px solid var(--color-accent-dark)', borderRadius: '6px'
                        }}
                    />
                </div>
            </div>

            <div className="member-grid">
                {filteredMembers.map(member => {
                    const isSelected = attendeeIds.has(member.memberId);
                    return (
                        <div
                            key={member.memberId}
                            className={`member-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleMember(member.memberId)}
                        >
                            <input type="checkbox" checked={isSelected} readOnly style={{ width: '16px', height: '16px' }} />
                            <span>{member.name}</span>
                        </div>
                    );
                })}
                {filteredMembers.length === 0 && <div style={{ color: '#888', marginTop: '10px' }}>검색 결과가 없습니다.</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" style={{ fontSize: '18px', padding: '15px 30px' }} onClick={handleFormation}>
                    조 편성 시작
                </button>
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>⏳</div>
                    과거 만남 이력을 분석하여 최적의 조를 구성하고 있습니다...
                </div>
            )}
        </div>
    );
}