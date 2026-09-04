import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

export default function Export() {
    const location = useLocation();
    const navigate = useNavigate();
    const captureRef = useRef(null);

    const { teams, currentRound, meetingDate } = location.state || {};

    useEffect(() => {
        document.title = "Bookend Weaver/export";
        if (!teams) {
            alert("출력할 데이터가 없습니다.");
            navigate('/members');
        }
    }, [teams, navigate]);

    const handleDownload = async () => {
        if (!captureRef.current) return;

        try {
            const canvas = await html2canvas(captureRef.current, { scale: 3, backgroundColor: '#ffffff' });
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            const roundText = String(currentRound) === "0" ? "OT" : `제${currentRound}회차`;
            link.download = `북엔드_${roundText}_조편성결과.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            alert("이미지 저장 중 오류가 발생했습니다.");
        }
    };

    if (!teams) return null;

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="page-title" style={{ border: 'none', marginBottom: '10px' }}>
                편성이 완료되었습니다!
            </h2>
            <div style={{ color: '#666', marginBottom: '30px' }}>
                아래 이미지를 다운로드하여 다른 운영진이나 단톡방에 공유하세요.
            </div>

            <div
                ref={captureRef}
                style={{
                    backgroundColor: '#ffffff',
                    padding: '10px 15px',
                    display: 'inline-block',
                    borderRadius: '8px'
                }}
            >
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {teams.map((team, idx) => {
                        const sortedMembers = [...team.members].sort((a, b) =>
                            (b.roleType === 'NEW' ? 1 : 0) - (a.roleType === 'NEW' ? 1 : 0)
                        );

                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '5px',
                                fontSize: '26px',
                                fontWeight: '500',
                                letterSpacing: '2px'
                            }}>
                                {sortedMembers.map((member) => (
                                    <span
                                        key={member.memberId}
                                        style={{
                                            color: member.roleType === 'NEW' ? '#ff3b30' : '#333333',
                                            fontWeight: member.roleType === '600'
                                        }}
                                    >
                                        {member.name}
                                    </span>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{display: 'flex', gap: '15px', marginTop: '40px'}}>
                <button className="btn-outline" onClick={() => navigate('/members')}
                        style={{padding: '12px 24px', fontSize: '16px'}}>
                    대시보드로 돌아가기
                </button>
                <button className="btn-primary" onClick={handleDownload}
                        style={{padding: '12px 24px', fontSize: '16px', backgroundColor: '#007aff'}}>
                    이미지 다운로드
                </button>
            </div>
        </div>
    );
}