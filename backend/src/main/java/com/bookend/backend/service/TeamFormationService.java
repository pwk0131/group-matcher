package com.bookend.backend.service;

import com.bookend.backend.dto.MemberDto;
import com.bookend.backend.dto.TeamFormationRequest;
import com.bookend.backend.engine.HistoryMatrix;
import com.bookend.backend.engine.Team;
import com.bookend.backend.engine.TeamFormationEngine;
import com.bookend.backend.entity.EncounterHistory;
import com.bookend.backend.entity.Member;
import com.bookend.backend.repository.EncounterHistoryRepository;
import com.bookend.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamFormationService {

	private final MemberRepository memberRepository;
	private final EncounterHistoryRepository historyRepository;
	private final TeamFormationEngine engine;

	// 조 편성 알고리즘 실행
	@Transactional(readOnly = true)
	public List<Team> generateTeams(TeamFormationRequest request) {

		// 1. 전달받은 ID를 기반으로 금일 참석자 엔티티 조회 후 DTO로 변환
		List<Member> attendees = memberRepository.findAllById(request.attendeeIds());
		List<MemberDto> attendeeDtos = attendees.stream()
			.map(MemberDto::from)
			.toList();

		// 최대 4명 기준 최적의 조 개수 자동 계산
		int totalMembers = attendeeDtos.size();
		int optimalTeamCount = (int) Math.ceil(totalMembers / 4.0);

		// 2. 과거 만남 이력(밴 리스트) 조회
		// 현재 회차 기준으로 3회차 전까지만 조회 (4회차 차이부터는 페널티 0점이	므로 무시)
		int thresholdRound = Math.max(1, request.currentRound() - 3);
		List<EncounterHistory> histories = historyRepository.findRecentHistories(request.attendeeIds(), thresholdRound);

		// 3. 초고속 조회를 위한 히스토리 매트릭스 메모리 로드
		HistoryMatrix matrix = new HistoryMatrix(histories);

		// 4. 알고리즘 코어 엔진 실행 및 결과 반환
		return engine.formTeams(attendeeDtos, matrix, optimalTeamCount, request.currentRound());

		// (참고: 최종 배포 전에는 여기서 짜여진 조(teams)를 TeamAssignment 테이블에 INSERT 하고,
		// EncounterHistory 테이블을 UPSERT 하는 저장 로직이 추가로 들어갑니다.)
	}
}