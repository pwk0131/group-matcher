package com.bookend.backend.service;

import com.bookend.backend.dto.MemberDto;
import com.bookend.backend.dto.TeamFormationRequest;
import com.bookend.backend.dto.TeamFormationResponse;
import com.bookend.backend.dto.TeamSaveRequest;
import com.bookend.backend.engine.HistoryMatrix;
import com.bookend.backend.engine.TeamFormationEngine;
import com.bookend.backend.entity.EncounterHistory;
import com.bookend.backend.entity.Meeting;
import com.bookend.backend.entity.Member;
import com.bookend.backend.entity.TeamAssignment;
import com.bookend.backend.repository.EncounterHistoryRepository;
import com.bookend.backend.repository.MeetingRepository;
import com.bookend.backend.repository.MemberRepository;
import com.bookend.backend.repository.TeamAssignmentRepository;
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
	private final MeetingRepository meetingRepository;
	private final TeamAssignmentRepository teamAssignmentRepository;

	// 조 편성 알고리즘 실행
	@Transactional(readOnly = true)
	public TeamFormationResponse generateTeams(TeamFormationRequest request) {

		// 전달받은 ID를 기반으로 금일 참석자 엔티티 조회 후 DTO로 변환
		List<Member> attendees = memberRepository.findAllById(request.attendeeIds());
		List<MemberDto> attendeeDtos = attendees.stream()
			.map(MemberDto::from)
			.toList();

		// 최대 4명 기준 최적의 조 개수 자동 계산
		int totalMembers = attendeeDtos.size();
		int optimalTeamCount = (int) Math.ceil(totalMembers / 4.0);

		// 과거 만남 이력(밴 리스트) 조회
		// 현재 회차 기준으로 3회차 전까지만 조회 (4회차 차이부터는 페널티 0점이므로 무시)
		int thresholdRound = Math.max(0, request.currentRound() - 3);
		List<EncounterHistory> histories = historyRepository.findRecentHistories(request.attendeeIds(), thresholdRound);

		// 초고속 조회를 위한 히스토리 매트릭스 메모리 로드
		HistoryMatrix matrix = new HistoryMatrix(histories);

		// 알고리즘 코어 엔진 실행 및 결과 반환
		return engine.formTeams(attendeeDtos, matrix, optimalTeamCount, request.currentRound());
	}

	@Transactional
	public void saveTeams(TeamSaveRequest request) {
		// 이번 회차(Meeting) 정보가 DB에 있으면 가져오고, 없으면 새로 만듭니다.
		Meeting meeting = meetingRepository.findByRoundNumber(request.currentRound())
			.orElseGet(() -> {
				Meeting newMeeting = new Meeting();
				newMeeting.setRoundNumber(request.currentRound());
				newMeeting.setMeetingDate(request.meetingDate());
				return meetingRepository.save(newMeeting);
			});

		// 확정된 조(Team)를 하나씩 돌면서 짝꿍 기록을 남깁니다.
		for (TeamSaveRequest.TeamData team : request.teams()) {
			for (TeamSaveRequest.MemberData memberData : team.members()) {
				Member member = memberRepository.findById(memberData.memberId()).orElseThrow();

				if (request.currentRound() > 0) {
					member.setAttendanceCount(member.getAttendanceCount() + 1);
				}

				TeamAssignment assignment = new TeamAssignment();
				assignment.setMeeting(meeting);
				assignment.setMember(member);
				assignment.setTeamName(team.teamName());
				teamAssignmentRepository.save(assignment);
			}

			List<Long> memberIds = team.members().stream()
				.map(TeamSaveRequest.MemberData::memberId)
				.toList();

			// 조 안의 모든 사람들을 1:1로 짝지어 만남 이력을 기록합니다.
			for (int i = 0; i < memberIds.size(); i++) {
				for (int j = i + 1; j < memberIds.size(); j++) {
					Long id1 = Math.min(memberIds.get(i), memberIds.get(j));
					Long id2 = Math.max(memberIds.get(i), memberIds.get(j));

					EncounterHistory history = historyRepository.findByMemberA_MemberIdAndMemberB_MemberId(id1, id2)
						.orElseGet(() -> {
							EncounterHistory newHistory = new EncounterHistory();
							newHistory.setMemberA(memberRepository.getReferenceById(id1));
							newHistory.setMemberB(memberRepository.getReferenceById(id2));
							return newHistory;
						});

					history.setLastMeeting(meeting);
					historyRepository.save(history);
				}
			}
		}
	}

	@Transactional
	public void updateTeams(Long meetingId, TeamSaveRequest request) {
		// 기존 미팅 기록 찾기
		Meeting meeting = meetingRepository.findById(meetingId)
			.orElseThrow(() -> new IllegalArgumentException("해당 기록을 찾을 수 없습니다."));

		// 기존 출석 횟수 롤백 및 기존 데이터 삭제
		if (meeting.getRoundNumber() > 0) {
			List<TeamAssignment> oldAssignments = teamAssignmentRepository.findByMeeting_MeetingId(meetingId);
			for (TeamAssignment ta : oldAssignments) {
				Member member = ta.getMember();
				member.setAttendanceCount(Math.max(0, member.getAttendanceCount() - 1));
			}
		}
		teamAssignmentRepository.deleteByMeeting_MeetingId(meetingId);
		historyRepository.deleteByLastMeeting_MeetingId(meetingId);

		// 미팅 정보(회차, 날짜) 업데이트
		meeting.setRoundNumber(request.currentRound());
		meeting.setMeetingDate(request.meetingDate());

		// 새로운 배정 및 만남 이력 저장
		for (TeamSaveRequest.TeamData team : request.teams()) {
			for (TeamSaveRequest.MemberData memberData : team.members()) {
				Member member = memberRepository.findById(memberData.memberId()).orElseThrow();
				if (request.currentRound() > 0) {
					member.setAttendanceCount(member.getAttendanceCount() + 1);
				}
				TeamAssignment assignment = new TeamAssignment();
				assignment.setMeeting(meeting);
				assignment.setMember(member);
				assignment.setTeamName(team.teamName());
				teamAssignmentRepository.save(assignment);
			}

			List<Long> memberIds = team.members().stream()
				.map(TeamSaveRequest.MemberData::memberId)
				.toList();

			for (int i = 0; i < memberIds.size(); i++) {
				for (int j = i + 1; j < memberIds.size(); j++) {
					Long id1 = Math.min(memberIds.get(i), memberIds.get(j));
					Long id2 = Math.max(memberIds.get(i), memberIds.get(j));

					EncounterHistory history = historyRepository.findByMemberA_MemberIdAndMemberB_MemberId(id1, id2)
						.orElseGet(() -> {
							EncounterHistory newHistory = new EncounterHistory();
							newHistory.setMemberA(memberRepository.getReferenceById(id1));
							newHistory.setMemberB(memberRepository.getReferenceById(id2));
							return newHistory;
						});
					history.setLastMeeting(meeting);
					historyRepository.save(history);
				}
			}
		}
	}
}