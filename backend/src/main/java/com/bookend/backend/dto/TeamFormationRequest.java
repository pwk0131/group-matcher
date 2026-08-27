package com.bookend.backend.dto;

import java.util.List;

public record TeamFormationRequest(
	List<Long> attendeeIds, // 금일 모임 참석자들의 회원 ID 목록
	int currentRound        // 현재 모임 회차 (예: 5회차)
) {
}