package com.bookend.backend.dto;

import com.bookend.backend.entity.Member;
import com.bookend.backend.entity.RoleType;

public record MemberDto(
	Long memberId,
	String name,
	RoleType roleType,
	int attendanceCount,
	boolean isFacilitator
) {
	// Entity -> DTO 변환을 편하게 하기 위한 팩토리 메서드
	public static MemberDto from(Member member) {
		return new MemberDto(
			member.getMemberId(),
			member.getName(),
			member.getRoleType(),
			member.getAttendanceCount(),
			member.isFacilitator()
		);
	}
}