package com.bookend.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long memberId;

	@Column(nullable = false, length = 50)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private RoleType roleType;

	@Column(nullable = false)
	private int attendanceCount;

	@JsonProperty("isFacilitator")
	@Column(nullable = false)
	private boolean isFacilitator;

	@JsonProperty("isInactive")
	@Column(nullable = false)
	private boolean isInactive;

	// 편의를 위한 빌더 패턴이나 생성자는 필요에 따라 나중에 추가할 수 있음
}
