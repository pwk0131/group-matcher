import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/History.css';

export default function History() {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        document.title = "Bookend Weaver/history";
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/history`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setHistoryList(data);
            }
        } catch (error) {
            console.error("이력 로딩 실패", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (meetingId, roundNumber) => {
        if (!window.confirm(`정말 제 ${roundNumber}회차 모임 기록을 삭제하시겠습니까?\n(해당 회차의 조 편성 결과 및 짝꿍 페널티 이력이 모두 삭제됩니다.)`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/history/${meetingId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                // 화면 즉시 업데이트
                setHistoryList(historyList.filter(h => h.meetingId !== meetingId));
            } else {
                alert("삭제 중 오류가 발생했습니다.");
            }
        } catch (error) {
            alert("서버와 통신할 수 없습니다.");
        }
    };

    const handleEdit = async (history) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/members`, { credentials: 'include' });
            const allMembers = await res.json();

            const formattedTeams = Object.entries(history.teams).map(([teamName, memberNames]) => {
                const members = memberNames.map(name => {
                    const found = allMembers.find(m => m.name === name);
                    return found || { memberId: `del-${name}`, name: name, roleType: 'EXISTING', isFacilitator: false };
                });
                return { teamName, members };
            });

            navigate('/result', {
                state: {
                    teams: formattedTeams,
                    currentRound: history.roundNumber,
                    meetingDate: history.meetingDate,
                    meetingId: history.meetingId,
                    isEditMode: true
                }
            });
        } catch (error) {
            alert("수정 화면으로 이동하는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2 className="page-title">만남 이력</h2>
            <div className="history-list">
                {isLoading ? (
                        /* 로딩 중일 때 표시 */
                        <div className="inline-loading-container">
                            <div className="spinner"></div>
                            <div className="loading-text">조 편성 기록을 가져오는 중 입니다.</div>
                        </div>
                ) : historyList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        저장된 모임 이력이 없습니다.
                    </div>
                ) : (
                    historyList.map(history => (
                        <div key={history.meetingId} className="history-card">
                            <div className="history-card-header">
                                <h3>
                                    {String(history.roundNumber) === "0" ? "🎉 OT (0회차)" : `제 ${history.roundNumber}회차`} 조
                                    편성
                                    <span className="history-date">({history.meetingDate})</span>
                                </h3>
                                <div style={{display: 'flex', gap: '8px'}}>
                                    <button className="btn-outline" onClick={() => handleEdit(history)}>
                                        수정
                                    </button>
                                    <button className="btn-outline"
                                            onClick={() => handleDelete(history.meetingId, history.roundNumber)}>
                                        삭제
                                    </button>
                                </div>
                            </div>

                            <div className="history-teams">
                                {Object.entries(history.teams).map(([teamName, members]) => (
                                    <div key={teamName} className="history-team-box">
                                        <div className="team-name-badge">{teamName}</div>
                                        <div className="team-members">
                                            {members.join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}