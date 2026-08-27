export default function Formation() {
    return (
        <div className="page-container">
            <h2 className="page-title">조 편성 세팅</h2>
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '8px', border: `1px solid var(--color-border)` }}>
                <p>이번 모임에 참석할 부원들을 선택하고 조 편성을 시작합니다.</p>
                <button className="btn-primary" style={{ marginTop: '20px' }}>조 편성 알고리즘 실행</button>
            </div>
        </div>
    );
}