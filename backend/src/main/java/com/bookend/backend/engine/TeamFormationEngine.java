package com.bookend.backend.engine;

import com.bookend.backend.dto.MemberDto;
import com.bookend.backend.entity.RoleType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class TeamFormationEngine {

	public List<Team> formTeams(List<MemberDto> attendees, HistoryMatrix matrix, int teamCount, int currentRound) {
		// 1. 초기 조(Team) 세팅
		List<Team> teams = new ArrayList<>();
		for (int i = 1; i <= teamCount; i++) {
			teams.add(new Team(i + "조"));
		}

		// 한 조당 들어갈 수 있는 최대 인원 (예: 15명 4개조면 4명)
		int maxTeamSize = (int) Math.ceil((double) attendees.size() / teamCount);

		// 2. 그룹 분리 (진행자, 신입, 기존)
		List<MemberDto> facilitators = new ArrayList<>();
		List<MemberDto> newMembers = new ArrayList<>();
		List<MemberDto> existingMembers = new ArrayList<>();

		for (MemberDto member : attendees) {
			if (member.isFacilitator()) {
				facilitators.add(member); // 마스터키(진행자) 최우선 분리
			} else if (member.roleType() == RoleType.NEW) {
				newMembers.add(member);
			} else {
				existingMembers.add(member);
			}
		}

		// 출석률이 높은 사람(배치하기 까다로운 사람)부터 먼저 배치하기 위해 내림차순 정렬
		Comparator<MemberDto> byAttendanceDesc = Comparator.comparingInt(MemberDto::attendanceCount).reversed();
		newMembers.sort(byAttendanceDesc);
		existingMembers.sort(byAttendanceDesc);

		// 3. 탐욕법(Greedy) 배치 실행 (우선순위 순서대로)
		for (MemberDto f : facilitators) {
			assignToBestTeam(f, teams, matrix, currentRound, maxTeamSize);
		}
		for (MemberDto n : newMembers) {
			assignToBestTeam(n, teams, matrix, currentRound, maxTeamSize);
		}
		for (MemberDto e : existingMembers) {
			assignToBestTeam(e, teams, matrix, currentRound, maxTeamSize);
		}

		return teams;
	}

	// 페널티가 가장 적게 오르는 조를 찾아 할당하는 메서드
	private void assignToBestTeam(MemberDto member, List<Team> teams, HistoryMatrix matrix, int currentRound, int maxTeamSize) {
		Team bestTeam = null;
		int minPenaltyIncrease = Integer.MAX_VALUE;

		for (Team team : teams) {
			if (team.getMembers().size() >= maxTeamSize) {
				continue; // 조 인원이 꽉 찼으면 패스
			}

			// 이 사람을 이 조에 넣었을 때 증가하는 페널티 계산
			int penaltyIncrease = calculatePenalty(member, team, matrix, currentRound);

			if (penaltyIncrease < minPenaltyIncrease) {
				// 더 페널티가 적은 조를 발견하면 무조건 교체
				minPenaltyIncrease = penaltyIncrease;
				bestTeam = team;
			} else if (penaltyIncrease == minPenaltyIncrease && bestTeam != null) {
				// 페널티가 같다면, 현재 인원이 더 적은 조를 우선 선택
				// 이 로직으로 사람이 몰리지 않고 4,4,4,3 으로 골고루 퍼집니다.
				if (team.getMembers().size() < bestTeam.getMembers().size()) {
					bestTeam = team;
				}
			}
		}

		if (bestTeam != null) {
			bestTeam.addMember(member);
			bestTeam.addPenalty(minPenaltyIncrease);
		}
	}

	// 10배수 지수 가중치 공식 적용 메서드
	private int calculatePenalty(MemberDto newMember, Team team, HistoryMatrix matrix, int currentRound) {
		int penalty = 0;

		for (MemberDto existingMember : team.getMembers()) {
			int deltaT = matrix.getDeltaT(newMember.memberId(), existingMember.memberId(), currentRound);

			// 1~3회차 이내에 만난 적이 있다면 지수 페널티 부과 (4회차 이상은 0점)
			if (deltaT > 0 && deltaT < 4) {
				penalty += (int) Math.pow(10, 4 - deltaT); // 1회차전: 1000점, 2회차전: 100점, 3회차전: 10점
			}
		}
		return penalty;
	}
}