package com.bookend.backend.engine;

import com.bookend.backend.dto.MemberDto;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class Team {
	private final String teamName;
	private final List<MemberDto> members = new ArrayList<>();
	private int totalPenaltyScore = 0; // 이 조가 가진 밴 리스트(중복) 페널티 총합

	public Team(String teamName) {
		this.teamName = teamName;
	}

	public void addMember(MemberDto member) {
		this.members.add(member);
	}

	public void addPenalty(int score) {
		this.totalPenaltyScore += score;
	}

	public boolean hasFacilitator() {
		return members.stream().anyMatch(MemberDto::isFacilitator);
	}
}