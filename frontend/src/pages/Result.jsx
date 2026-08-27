export default function Result() {
    return (
        <div className="page-container">
            <h2 className="page-title">편성 결과 및 튜닝</h2>
            <p>드래그 앤 드롭으로 조를 수정하고 최종 확정하는 화면이 들어갈 예정입니다.</p>
            {/* 임시 버튼 */}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button className="btn-outline">다시 섞기</button>
                <button className="btn-primary">DB에 확정 저장</button>
            </div>
        </div>
    );
}