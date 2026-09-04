import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles/Result.css';

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
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [benchMembers, setBenchMembers] = useState([]);
    const [activeMoveMember, setActiveMoveMember] = useState(null);

    const [isSaving, setIsSaving] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [meetingId, setMeetingId] = useState(null);

    const [allMembers, setAllMembers] = useState([]);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        document.title = "Bookend Weaver/result";

        if (!location.state || !location.state.teams) {
            alert("조 편성 데이터가 없습니다. 세팅 화면으로 이동합니다.");
            navigate('/formation');
            return;
        }

        setCurrentRound(location.state.currentRound);
        setMeetingDate(location.state.meetingDate);
        setLogs(location.state.logs || []);

        if (location.state.isEditMode) {
            setIsEditMode(true);
            setMeetingId(location.state.meetingId);
        }

        fetchHistoryAndInitialize(location.state.teams, location.state.currentRound);
    }, [location, navigate]);

    const handleDragStart = (e, member, fromLocation) => {
        e.stopPropagation();
        setDragInfo({ type: 'member', member, fromLocation });
    };

    const handleTeamDragStart = (e, teamIndex) => {
        e.stopPropagation();
        setDragInfo({ type: 'team', teamIndex });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleModalMove = (toLocation) => {
        if (activeMoveMember) {
            moveMember(activeMoveMember.member, activeMoveMember.fromLocation, toLocation);
            setActiveMoveMember(null); // 이동 후 모달 닫기
        }
    };

    const swapTeams = (fromIndex, toIndex) => {
        if (fromIndex === toIndex) return;
        const newTeams = [...teams];

        const temp = newTeams[fromIndex];
        newTeams[fromIndex] = newTeams[toIndex];
        newTeams[toIndex] = temp;

        const tempName = newTeams[fromIndex].teamName;
        newTeams[fromIndex].teamName = newTeams[toIndex].teamName;
        newTeams[toIndex].teamName = tempName;

        setTeams(newTeams);
    };

    const moveMember = (member, fromLocation, toLocation) => {
        if (fromLocation === toLocation) return;

        const newTeams = [...teams];
        let newBench = [...benchMembers];

        if (fromLocation === 'bench') {
            newBench = newBench.filter(m => m.memberId !== member.memberId);
        } else {
            newTeams[fromLocation].members = newTeams[fromLocation].members.filter(m => m.memberId !== member.memberId);
        }

        if (toLocation === 'bench') {
            newBench.push(member);
        } else {
            newTeams[toLocation].members.push(member);
        }

        if (fromLocation !== 'bench') {
            const fromConflicts = getTeamConflicts(newTeams[fromLocation].members, currentRound, historyMatrix);
            newTeams[fromLocation].penalty = fromConflicts.penalty;
            newTeams[fromLocation].conflicts = fromConflicts.conflicts;
        }
        if (toLocation !== 'bench') {
            const toConflicts = getTeamConflicts(newTeams[toLocation].members, currentRound, historyMatrix);
            newTeams[toLocation].penalty = toConflicts.penalty;
            newTeams[toLocation].conflicts = toConflicts.conflicts;
        }

        setTeams(newTeams);
        setBenchMembers(newBench);
    };

    const fetchHistoryAndInitialize = async (initialTeams, round) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/history`, { credentials: 'include' });

            const memRes = await fetch(`${API_BASE_URL}/api/members`, { credentials: 'include' });
            if (memRes.ok) {
                const memData = await memRes.json();
                setAllMembers(memData.filter(m => !m.isInactive));
            }

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
                        conflicts.push(`${m1} ↔ ${m2} (${roundText} 같은 조)`);
                    }
                }
            }
        }
        return { penalty, conflicts };
    };

    const handleDrop = (e, toLocation) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragInfo) return;

        if (dragInfo.type === 'member') {
            moveMember(dragInfo.member, dragInfo.fromLocation, toLocation);
        } else if (dragInfo.type === 'team' && toLocation !== 'bench') {
            swapTeams(dragInfo.teamIndex, toLocation);
        }

        setDragInfo(null);
    };

    const handleSave = async () => {

        if (benchMembers.length > 0) {
            alert("대기소에 남아있는 인원이 있습니다. 모두 조에 배정해주세요.");
            return;
        }

        const totalPenalty = teams.reduce((sum, t) => sum + t.penalty, 0);
        const roundText = String(currentRound) === "0" ? "OT(0회차)" : `제 ${currentRound}회차`;

        const modeText = isEditMode ? "수정사항을 덮어쓰시겠습니까?" : "결과를 저장하시겠습니까?";

        const warningMsg = totalPenalty > 0
            ? `현재 편성에서 과거에 만난 이력이 겹치는 멤버가 있습니다. (페널티 ${totalPenalty}점)\n정말 이대로 확정하시겠습니까?`
            : `${roundText} 조 편성을 이대로 확정하시겠습니까?\n(페널티 0점의 완벽한 조합입니다!)`;

        if (!window.confirm(warningMsg)) return;

        setIsSaving(true);

        try {
            const apiUrl = isEditMode
                ? `${API_BASE_URL}/api/history/${meetingId}`
                : `${API_BASE_URL}/api/teams/save`;

            const httpMethod = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(apiUrl, {
                method: httpMethod,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ currentRound, meetingDate, teams })
            });

            if (response.ok) {
                alert(`${roundText} 편성이 성공적으로 ${isEditMode ? '수정' : '저장'}되었습니다!`);
                navigate(isEditMode ? '/history' : '/members');
            } else {
                alert(`${isEditMode ? '수정' : '저장'}에 실패했습니다.`);
            }
        } catch (error) {
            alert("서버 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const participatingIds = new Set();
    teams.forEach(t => t.members.forEach(m => participatingIds.add(m.memberId)));
    benchMembers.forEach(m => participatingIds.add(m.memberId));

    const availableMembers = allMembers.filter(m => !participatingIds.has(m.memberId));

    const handleAddExtraMember = (e) => {
        const memberId = Number(e.target.value);
        if (!memberId) return;

        const memberToAdd = allMembers.find(m => m.memberId === memberId);
        if (memberToAdd) {
            setBenchMembers([...benchMembers, memberToAdd]);
        }

        e.target.value = "";
    };

    if (isLoading) {
        return (
            <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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
                    편성된 조 가져오는 중..
                </div>
                <div style={{ fontSize: '15px', color: '#555', textAlign: 'center', lineHeight: '1.6' }}>
                    편성된 조와 과거 만남 기록을 비교하여<br/>
                    어쩌구 저쩌구..
                </div>
            </div>
        );
    }

    if (teams.length === 0) return null;

    return (
        <div className="page-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h2 className="page-title" style={{margin: 0, border: 'none'}}>
                    {String(currentRound) === "0" ? "OT (0회차)" : `제 ${currentRound}회차`} 조 편성 결과 <span
                    style={{fontSize: '18px', color: '#888'}}>({meetingDate})</span>
                </h2>

                <div style={{display: 'flex', gap: '10px'}}>
                    <button className="btn-outline" onClick={() => navigate('/formation')}>다시 편성하기</button>

                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            minWidth: '110px',
                            opacity: isSaving ? 0.7 : 1,
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSaving ? (
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                                <span className="btn-spinner"></span>
                                저장 중...
                            </div>
                        ) : (
                            'DB 저장'
                        )}
                    </button>

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
                                    {String(hist.roundNumber) === "0" ? "OT (0회차)" : `제 ${hist.roundNumber}회차`} <span
                                    style={{color: '#888', fontWeight: 'normal'}}>({hist.meetingDate})</span>
                                </div>
                                {Object.entries(hist.teams).map(([tName, members]) => (
                                    <div key={tName} className="history-quickview-team">
                                        <span style={{
                                            color: 'var(--color-accent-dark)',
                                            fontWeight: 'bold',
                                            display: 'inline-block',
                                            width: '30px'
                                        }}>{tName}</span>
                                        <span style={{color: '#555'}}>{members.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{marginBottom: '15px', display: 'flex', gap: '10px'}}>
                <button
                    className="btn-outline"
                    onClick={() => setIsHelpOpen(true)}
                    style={{fontSize: '13px', padding: '6px 12px'}}
                >
                    💡 사용법 안내
                </button>

                <button
                    className="btn-outline"
                    onClick={() => setIsLogOpen(true)}
                    style={{fontSize: '13px', padding: '6px 12px'}}
                >
                    상세 편성 로그
                </button>
            </div>


            <div className="bench-container" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'bench')}>
                <div className="bench-header" style={{justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>

                        <span>임시 박스</span>

                        <span style={{fontSize: '13px', color: '#888', fontWeight: 'normal'}}>
                            {benchMembers.length > 0 ? `${benchMembers.length}명 대기 중` : '이동할 조원을 여기에 끌어다 놓으세요.'}
                        </span>

                    </div>

                    {availableMembers.length > 0 && (
                        <select
                            className="mobile-move-select"
                            onChange={handleAddExtraMember}
                            defaultValue=""
                            style={{padding: '6px 10px', fontSize: '13px', backgroundColor: '#fff'}}
                        >
                            <option value="" disabled>추가 참석자 부르기</option>
                            {availableMembers.map(m => (
                                <option key={m.memberId} value={m.memberId}>{m.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="bench-list">
                    {benchMembers.map(member => (
                        <div key={member.memberId}
                             className={`member-item ${member.roleType === 'NEW' ? 'new-member-card' : ''}`} draggable
                             onDragStart={(e) => handleDragStart(e, member, 'bench')}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <span style={{fontWeight: 'bold'}}>{member.name}</span>
                                </div>
                                <button
                                    className="move-trigger-btn"
                                    onClick={() => setActiveMoveMember({member, fromLocation: 'bench'})}
                                    title="팀 이동"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <path d="M17 3l4 4-4 4"></path>
                                        <path d="M3 7h18"></path>
                                        <path d="M7 21l-4-4 4-4"></path>
                                        <path d="M21 17H3"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isLogOpen && (
                <div className="about-modal-overlay" onClick={() => setIsLogOpen(false)}>
                    <div className="about-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '25px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: 'var(--color-accent-dark)' }}>
                                알고리즘 편성 로그
                            </h3>
                            <button className="settings-btn" onClick={() => setIsLogOpen(false)} style={{ fontSize: '18px', padding: '4px' }}>✕</button>
                        </div>

                        <div className="clean-log-container">
                            {logs.length > 0 ? logs.map((logLine, idx) => (
                                <div key={idx} className="clean-log-item">{logLine}</div>
                            )) : (
                                <div style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>로그 데이터가 없습니다.</div>
                            )}
                        </div>

                        <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setIsLogOpen(false)}>
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {isHelpOpen && (
                <div className="about-modal-overlay" onClick={() => setIsHelpOpen(false)}>
                    <div className="about-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '25px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--color-accent-dark)' }}>
                            💡 조 편성 결과 수정 가이드
                        </h3>

                        <ul style={{ paddingLeft: '20px', lineHeight: '1.7', color: '#555', fontSize: '14px', margin: 0, wordBreak: 'keep-all' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <b>조원 이동:</b> 이름을 잡아 다른 조로 <b>드래그</b>하거나, 우측의 <b>이동 버튼(⇄)</b>을 눌러 간편하게 옮겨보세요.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <b>조 통째로 교체:</b> 조 이름 옆의 <b>점자(⠿)</b> 아이콘을 잡고 다른 조로 드래그하면 두 조의 멤버가 통째로 맞바뀝니다.
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <b>임시 보류:</b> 배치하기 애매한 조원은 <b>임시 보류 박스</b>에 넣어둘 수 있습니다. (※ 보류 박스를 모두 비워야 DB 저장이 가능합니다)
                            </li>
                            <li style={{ marginBottom: '8px' }}>
                                <b>지각/추가 인원:</b> 뒤늦게 참석한 사람은 보류 박스 우측의 <b>'추가 참석자 부르기'</b>에서 즉시 소환할 수 있습니다.
                            </li>
                            <li>
                                <b>페널티 경고:</b> 조를 바꿀 때 과거 만남 이력과 겹치는 사람이 생기면, 즉시 <b>노란색 경고창</b>이 떠서 알려줍니다.
                            </li>
                        </ul>

                        <button className="btn-primary" style={{ width: '100%', marginTop: '25px' }} onClick={() => setIsHelpOpen(false)}>
                            확인했습니다
                        </button>
                    </div>
                </div>
            )}

            <div className="result-board">
                {teams.map((team, teamIndex) => (
                    <div
                        key={team.teamName || teamIndex}
                        className="team-column"
                        draggable
                        onDragStart={(e) => handleTeamDragStart(e, teamIndex)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, teamIndex)}
                    >

                        <div className="team-header" style={{cursor: 'grab'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <span style={{color: '#ccc', cursor: 'grab'}}>⠿</span>
                                <span>{team.teamName}</span>
                            </div>
                            <span style={{fontSize: '14px', color: '#888', fontWeight: 'normal'}}>
                                {team.members.length}명
                            </span>
                        </div>

                        {team.conflicts && team.conflicts.length > 0 && (
                            <div className="team-penalty-box">
                                <div style={{fontWeight: 'bold', marginBottom: '5px'}}>⚠️ 겹치는 이력 발견</div>
                                {team.conflicts.map((conflictMsg, idx) => (
                                    <div key={idx} className="penalty-item">{conflictMsg}</div>
                                ))}
                            </div>
                        )}

                        <div className="member-list">
                            {team.members.map(member => (
                                <div key={member.memberId}
                                     className={`member-item ${member.roleType === 'NEW' ? 'new-member-card' : ''}`}
                                     draggable onDragStart={(e) => handleDragStart(e, member, teamIndex)}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <span style={{fontWeight: 'bold'}}>{member.name}</span>
                                            {member.isFacilitator && <span className="facilitator-badge">진행자</span>}
                                        </div>

                                        <button
                                            className="move-trigger-btn"
                                            onClick={() => setActiveMoveMember({member, fromLocation: teamIndex})}
                                            title="팀 이동"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                                 strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3l4 4-4 4"></path>
                                                <path d="M3 7h18"></path>
                                                <path d="M7 21l-4-4 4-4"></path>
                                                <path d="M21 17H3"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {activeMoveMember && (
                <div className="about-modal-overlay" onClick={() => setActiveMoveMember(null)}>
                    <div className="about-modal-content" onClick={e => e.stopPropagation()}
                         style={{maxWidth: '350px', padding: '25px'}}>
                        <h3 style={{
                            marginTop: 0,
                            marginBottom: '20px',
                            color: 'var(--color-accent-dark)',
                            textAlign: 'center'
                        }}>
                            어디로 이동할까요?
                            <div style={{fontSize: '14px', color: '#666', fontWeight: 'normal', marginTop: '6px' }}>
                                <b>{activeMoveMember.member.name}</b> 님의 새 조를 선택해주세요.
                            </div>
                        </h3>

                        <div className="move-options-grid">
                            <button
                                className={`move-option-btn ${activeMoveMember.fromLocation === 'bench' ? 'current' : ''}`}
                                onClick={() => handleModalMove('bench')}
                                disabled={activeMoveMember.fromLocation === 'bench'}
                            >
                                보류
                            </button>

                            {teams.map((t, idx) => (
                                <button
                                    key={idx}
                                    className={`move-option-btn ${activeMoveMember.fromLocation === idx ? 'current' : ''}`}
                                    onClick={() => handleModalMove(idx)}
                                    disabled={activeMoveMember.fromLocation === idx}
                                >
                                    {t.teamName}
                                </button>
                            ))}
                        </div>
                        <button className="btn-outline" style={{ width: '100%', marginTop: '15px' }} onClick={() => setActiveMoveMember(null)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}
