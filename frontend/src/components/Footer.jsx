import { useState } from 'react';
import './Footer.css';

export default function Footer() {
    // About 모달 창 표시 여부를 관리하는 상태
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <>
            <footer className="footer-container">
                <div className="footer-content">

                    <div className="footer-links">
                        {/* About 버튼 (클릭 시 모달 열림) */}
                        <button className="footer-link-btn" onClick={() => setIsAboutOpen(true)}>
                            About
                        </button>
                        <a href="https://github.com/pwk0131/group-matcher" target="_blank" rel="noopener noreferrer">
                            GitHub Repository
                        </a>
                        <a href="https://github.com/pwk0131" target="_blank" rel="noopener noreferrer">
                            Developer Profile
                        </a>
                    </div>

                    <div className="footer-copyright">
                        © {new Date().getFullYear()} Bookend. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* --- About 모달 팝업 창 --- */}
            {isAboutOpen && (
                <div className="about-modal-overlay" onClick={() => setIsAboutOpen(false)}>
                    <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0, color: 'var(--color-accent-dark)'}}>About Bookend</h3>
                        <p style={{lineHeight: '1.6', color: '#555', wordBreak: 'keep-all', margin: '0 0 15px 0'}}>
                            독서 모임이나 스터디에서 매번 조를 편성하는 번거로움을 덜어주고자 기획되었습니다.
                            <br /><br />
                            과거의 만남 기록을 바탕으로 겹치는 인원을 최소화하여, 매번 새로운 사람들과 다양한 의견을 나눌 수 있는 최적의 조를 자동으로 편성해 줍니다.
                        </p>

                        <hr style={{border: 'none', borderTop: '1px dashed #ddd', margin: '15px 0'}}/>

                        <div style={{lineHeight: '1.6', color: '#666', fontSize: '13.5px', wordBreak: 'keep-all'}}>
                            <strong style={{color: 'var(--color-accent-dark)'}}>💡 TMI </strong><br/>
                            사실 이 서비스는 저의 굳어버린 깃허브를 해동하기 위한 <b>코딩 재활 운동</b>에서 시작되었습니다.<br/><br/>
                            북엔드의 조 편성을 담당하는 부원님은 이 툴을 맘껏, 편하게 사용해 주세요. 만약 버그를 발견하신다면 제 GitHub를 통해 제보
                            부탁드립니다.
                        </div>
                        <button
                            className="btn-primary"
                            style={{width: '100%', marginTop: '15px'}}
                            onClick={() => setIsAboutOpen(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}