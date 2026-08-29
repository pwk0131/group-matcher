package com.bookend.backend.engine;

import com.bookend.backend.dto.MemberDto;
import com.bookend.backend.dto.TeamFormationResponse;
import com.bookend.backend.entity.RoleType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class TeamFormationEngine {

	public TeamFormationResponse formTeams(List<MemberDto> attendees, HistoryMatrix matrix, int teamCount, int currentRound) {
		List<Team> teams = new ArrayList<>();
		for (int i = 1; i <= teamCount; i++) {
			teams.add(new Team(i + "조"));
		}

		int maxTeamSize = (int) Math.ceil((double) attendees.size() / teamCount);

		List<MemberDto> facilitators = new ArrayList<>();
		List<MemberDto> newMembers = new ArrayList<>();
		List<MemberDto> existingMembers = new ArrayList<>();

		for (MemberDto member : attendees) {
			if (member.isFacilitator()) facilitators.add(member);
			else if (member.roleType() == RoleType.NEW) newMembers.add(member);
			else existingMembers.add(member);
		}

		Comparator<MemberDto> byAttendanceDesc = Comparator.comparingInt(MemberDto::attendanceCount).reversed();
		newMembers.sort(byAttendanceDesc);
		existingMembers.sort(byAttendanceDesc);

		List<String> logs = new ArrayList<>();
		logs.add(String.format("▶ 조 편성 시작: 총 %d명, %d개 조 편성 (최대 인원: %d명)", attendees.size(), teamCount, maxTeamSize));
		logs.add(String.format("▶ 부원 분류: 진행자 %d명, 신입 %d명, 기존 %d명", facilitators.size(), newMembers.size(), existingMembers.size()));

		logs.add("\n[1단계] 진행자 우선 배치");
		for (MemberDto f : facilitators) assignToBestTeam(f, teams, matrix, currentRound, maxTeamSize, logs);

		logs.add("\n[2단계] 신입 부원 배치 (출석 많은 순)");
		for (MemberDto n : newMembers) assignToBestTeam(n, teams, matrix, currentRound, maxTeamSize, logs);

		logs.add("\n[3단계] 기존 부원 배치 (출석 많은 순)");
		for (MemberDto e : existingMembers) assignToBestTeam(e, teams, matrix, currentRound, maxTeamSize, logs);

		logs.add("\n▶ 조 편성 종료: 패널티 최소화 완료");

		return new TeamFormationResponse(teams, logs);
	}

	private void assignToBestTeam(MemberDto member, List<Team> teams, HistoryMatrix matrix, int currentRound, int maxTeamSize, List<String> logs) {
		Team bestTeam = null;
		int minPenaltyIncrease = Integer.MAX_VALUE;
		List<String> penaltyDetails = new ArrayList<>();

		for (Team team : teams) {
			if (team.getMembers().size() >= maxTeamSize) {
				penaltyDetails.add(team.getTeamName() + "(정원초과)");
				continue;
			}

			int penaltyIncrease = calculatePenalty(member, team, matrix, currentRound);
			penaltyDetails.add(team.getTeamName() + "(+" + penaltyIncrease + "점)");

			if (penaltyIncrease < minPenaltyIncrease) {
				minPenaltyIncrease = penaltyIncrease;
				bestTeam = team;
			} else if (penaltyIncrease == minPenaltyIncrease && bestTeam != null) {

				if (team.getMembers().size() < bestTeam.getMembers().size()) {
					bestTeam = team;
				}
			}
		}

		if (bestTeam != null) {
			bestTeam.addMember(member);
			bestTeam.addPenalty(minPenaltyIncrease);

			String roleStr = member.isFacilitator() ? "진행자" : (member.roleType() == RoleType.NEW ? "신입" : "기존");
			logs.add(String.format(" - %s %s ➔ %s 배정 | 비교: [%s] | 최종 페널티: +%d점",
				roleStr, member.name(), bestTeam.getTeamName(), String.join(", ", penaltyDetails), minPenaltyIncrease));
		}
	}

	private int calculatePenalty(MemberDto newMember, Team team, HistoryMatrix matrix, int currentRound) {
		int penalty = 0;
		for (MemberDto existingMember : team.getMembers()) {
			int deltaT = matrix.getDeltaT(newMember.memberId(), existingMember.memberId(), currentRound);
			if (deltaT > 0 && deltaT < 4) {
				penalty += (int) Math.pow(10, 4 - deltaT);
			}
		}
		return penalty;
	}
}