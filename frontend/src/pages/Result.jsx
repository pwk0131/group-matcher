import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Result.css';

export default function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [meetingDate, setMeetingDate] = useState(null);
    const [dragInfo, setDragInfo] = useState(null);

    const [historyList, setHistoryList] = useState([]);
    const [historyMatrix, setHistoryMatrix] = useState({});

    const [logs, setLogs] = useState([]);
    const [isLogOpen, setIsLogOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!location.state || !location.state.teams) {
            alert("조 편성 데이터가 없습니다. 세팅 화면으로 이동합니다.");
            navigate('/formation');
            return;
        }

        setCurrentRound(location.state.currentRound);
        setMeetingDate(location.state.meetingDate);
        setLogs(location.state.logs || []);
        fetchHistoryAndInitialize(location.state.teams, location.state.currentRound);
    }, [location, navigate]);

    const fetchHistoryAndInitialize = async (initialTeams, round) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/history`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setHistoryList(data);

                const matrix = {};
                data.forEach(hist => {
                    Object.values(hist.teams).forEach(membersInTeam => {
                        for(let i=0; i<membersInTeam.length; i++){
                            for(let j=i+1; j<membersInTeam.length; j++){
                                const m1 = membersInTeam[i];
                                const m2 = membersInTeam[j];
                                if(!matrix[m1]) matrix[m1] = {};
                                if(!matrix[m2]) matrix[m2] = {};

                                // 0회차 버그 방어 코드 (?? -1)
                                matrix[m1][m2] = Math.max(matrix[m1][m2] ?? -1, hist.roundNumber);
                                matrix[m2][m1] = Math.max(matrix[m2][m1] ?? -1, hist.roundNumber);
                            }
                        }
                    });
                });

                setHistoryMatrix(matrix);

                const teamsWithConflicts = initialTeams.map(team => {
                    const { penalty, conflicts } = getTeamConflicts(team.members, round, matrix);
                    return { ...team, penalty, conflicts };
                });
                setTeams(teamsWithConflicts);
            }
        } catch (error) {
            console.error("이력 로딩 실패", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTeamConflicts = (members, round, matrix) => {
        const conflicts = [];
        let penalty = 0;

        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const m1 = members[i].name;
                const m2 = members[j].name;
                const lastRound = matrix[m1]?.[m2];

                if (typeof lastRound === 'number') {
                    const delta = round - lastRound;
                    if (delta > 0 && delta < 4) {
                        penalty += Math.pow(10, 4 - delta);
                        const timeAgo = delta === 1 ? '직전 모임' : `${delta}회 전`;
                        const roundText = lastRound === 0 ? 'OT' : `${lastRound}회차`;
                        conflicts.push(`🚨 ${m1} ↔ ${m2} (${roundText} 같은 조)`);
                    }
                }
            }
        }
        return { penalty, conflicts };
    };

    const handleDragStart = (e, member, teamIndex) => {
        setDragInfo({ member, fromTeamIndex: teamIndex });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, toTeamIndex) => {
        e.preventDefault();
        if (!dragInfo) return;

        const { member, fromTeamIndex } = dragInfo;
        if (fromTeamIndex === toTeamIndex) return;

        const newTeams = [...teams];
        newTeams[fromTeamIndex].members = newTeams[fromTeamIndex].members.filter(m => m.memberId !== member.memberId);
        newTeams[toTeamIndex].members.push(member);

        const fromConflicts = getTeamConflicts(newTeams[fromTeamIndex].members, currentRound, historyMatrix);
        newTeams[fromTeamIndex].penalty = fromConflicts.penalty;
        newTeams[fromTeamIndex].conflicts = fromConflicts.conflicts;

        const toConflicts = getTeamConflicts(newTeams[toTeamIndex].members, currentRound, historyMatrix);
        newTeams[toTeamIndex].penalty = toConflicts.penalty;
        newTeams[toTeamIndex].conflicts = toConflicts.conflicts;

        setTeams(newTeams);
        setDragInfo(null);
    };

    const handleSave = async () => {
        const totalPenalty = teams.reduce((sum, t) => sum + t.penalty, 0);
        const roundText = String(currentRound) === "0" ? "OT(0회차)" : `제 ${currentRound}회차`;

        const warningMsg = totalPenalty > 0
            ? `현재 편성에서 과거에 만난 이력이 겹치는 멤버가 있습니다. (페널티 ${totalPenalty}점)\n정말 이대로 확정하시겠습니까?`
            : `${roundText} 조 편성을 이대로 확정하시겠습니까?\n(페널티 0점의 완벽한 조합입니다!)`;

        if (!window.confirm(warningMsg)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/teams/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentRound, meetingDate, teams })
            });

            if (response.ok) {
                alert(`${roundText} 조 편성이 성공적으로 저장되었습니다`);
                navigate('/members');
            } else {
                alert("저장 중 오류가 발생했습니다.");
            }
        } catch (error) {
            alert("서버와 통신할 수 없습니다.");
        }
    };

    if (isLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                {/* 앞서 Formation.css에 만든 조 편성 애니메이션 CSS 클래스를 그대로 재사용합니다 */}
                <div className="formation-loader-container">
                    <div className="team-box">
                        <div className="member-dot"></div>
                        <div className="member-dot"></div>
                    </div>
                    <div className="team-box">
                        <div className="member-dot"></div>
                        <div className="member-dot"></div>
                    </div>
                    <div className="team-box">
                        <div className="member-dot"></div>
                        <div className="member-dot"></div>
                    </div>
                </div>

                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-accent-dark)', marginBottom: '12px' }}>
                    결과를 분석하고 있습니다...
                </div>
                <div style={{ fontSize: '15px', color: '#555', textAlign: 'center', lineHeight: '1.6' }}>
                    편성된 조와 과거 만남 기록을 비교하여<br/>
                    충돌 여부 및 패널티를 계산 중입니다.
                </div>
            </div>
        );
    }

    if (teams.length === 0) return null;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="page-title" style={{ margin: 0, border: 'none' }}>
                    {String(currentRound) === "0" ? "OT (0회차)" : `제 ${currentRound}회차`} 조 편성 결과 <span style={{fontSize: '18px', color: '#888'}}>({meetingDate})</span>
                </h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-outline" onClick={() => navigate('/formation')}>다시 편성하기</button>
                    <button className="btn-primary" onClick={handleSave}>DB에 최종 확정 저장</button>
                </div>
            </div>

            {historyList.length > 0 && (
                <div className="history-quickview-section">
                    <div className="history-quickview-header">
                        최근 과거 이력 참고
                    </div>
                    <div className="history-quickview-scroll">
                        {historyList.map(hist => (
                            <div key={hist.meetingId} className="history-quickview-card">
                                <div className="history-quickview-card-title">
                                    {String(hist.roundNumber) === "0" ? "OT (0회차)" : `제 ${hist.roundNumber}회차`} <span style={{color:'#888', fontWeight:'normal'}}>({hist.meetingDate})</span>
                                </div>
                                {Object.entries(hist.teams).map(([tName, members]) => (
                                    <div key={tName} className="history-quickview-team">
                                        <span style={{ color: 'var(--color-accent-dark)', fontWeight: 'bold', display: 'inline-block', width: '30px' }}>{tName}</span>
                                        <span style={{ color: '#555'}}>{members.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '15px' }}>
                <button
                    className="btn-outline"
                    onClick={() => setIsLogOpen(!isLogOpen)}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                    {isLogOpen ? " ▶ 상세 로그 숨기기" : "▶ 상세 로그 보기"}
                </button>
            </div>

            {isLogOpen && logs.length > 0 && (
                <div className="log-console-container">
                    <div className="log-console-header">
                        <span>Terminal - Team Formation Algorithm</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>Running... Done!</span>
                    </div>
                    <div className="log-console-body">
                        {logs.map((logLine, idx) => (
                            <div key={idx}>{logLine}</div>
                        ))}
                    </div>
                </div>
            )}

            <div className="result-board">
                {teams.map((team, teamIndex) => (
                    <div key={team.teamName || teamIndex} className="team-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, teamIndex)}>
                        <div className="team-header">
                            <span>{team.teamName}</span>
                            <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>{team.members.length}명</span>
                        </div>

                        {team.conflicts && team.conflicts.length > 0 && (
                            <div className="team-penalty-box">
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⚠️ 겹치는 이력 발견!</div>
                                {team.conflicts.map((conflictMsg, idx) => (
                                    <div key={idx} className="penalty-item">{conflictMsg}</div>
                                ))}
                            </div>
                        )}

                        <div className="member-list">
                            {team.members.map(member => (
                                <div key={member.memberId} className={`member-item ${member.roleType === 'NEW' ? 'new-member-card' : ''}`} draggable onDragStart={(e) => handleDragStart(e, member, teamIndex)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold' }}>{member.name}</span>
                                            {member.isFacilitator && <span className="facilitator-badge">진행자</span>}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#888' }}>{member.roleType === 'NEW' ? '신입' : '기존'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}