package com.bookend.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record TeamSaveRequest(int currentRound, LocalDate meetingDate, List<TeamData> teams) {
	public record TeamData(String teamName, List<MemberData> members) {}
	public record MemberData(Long memberId) {}
}