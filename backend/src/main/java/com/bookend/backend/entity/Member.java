package com.bookend.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long memberId;

	@Column(nullable = false, length = 50)
	private String name;

	@Enumerated(EnumType.STRING) // Enum 이름을 문자열 그대로 DB에 저장
	@Column(nullable = false)
	private RoleType roleType;

	@Column(nullable = false)
	private int attendanceCount;

	@Column(nullable = false)
	private boolean isFacilitator;

	@Column(nullable = false)
	private boolean isActive;

	// 편의를 위한 빌더 패턴이나 생성자는 필요에 따라 나중에 추가할 수 있음
}
