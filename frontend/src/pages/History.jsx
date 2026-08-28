import { useState, useEffect } from 'react';
import './History.css';

export default function History() {
    const [historyList, setHistoryList] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/history', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setHistoryList(data);
            }
        } catch (error) {
            console.error("이력 로딩 실패", error);
        }
    };

    const handleDelete = async (meetingId, roundNumber) => {
        if (!window.confirm(`정말 제 ${roundNumber}회차 모임 기록을 삭제하시겠습니까?\n(해당 회차의 조 편성 결과 및 짝꿍 페널티 이력이 모두 삭제됩니다.)`)) return;

        try {
            const res = await fetch(`http://localhost:8080/api/history/${meetingId}`, {
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

    return (
        <div className="page-container">
            <h2 className="page-title">만남 이력</h2>

            <div className="history-list">
                {historyList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        저장된 모임 이력이 없습니다.
                    </div>
                ) : (
                    historyList.map(history => (
                        <div key={history.meetingId} className="history-card">
                            <div className="history-card-header">
                                <h3>
                                    {String(history.roundNumber) === "0" ? "🎉 OT (0회차)" : `제 ${history.roundNumber}회차`} 조 편성
                                    <span className="history-date">({history.meetingDate})</span>
                                </h3>
                                <button className="btn-outline" onClick={() => handleDelete(history.meetingId, history.roundNumber)}>기록 삭제</button>
                            </div>

                            <div className="history-teams">
                                {/* 1조, 2조 등 팀별로 렌더링 */}
                                {Object.entries(history.teams).map(([teamName, members]) => (
                                    <div key={teamName} className="history-team-box">
                                        <div className="team-name">{teamName}</div>
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