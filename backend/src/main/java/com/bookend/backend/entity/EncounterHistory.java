package com.bookend.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EncounterHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long historyId;

	// 항상 작은 ID를 memberA에, 큰 ID를 memberB에 넣어 방향성(중복 쌍) 방지
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_a_id", nullable = false)
	private Member memberA;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_b_id", nullable = false)
	private Member memberB;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "last_meeting_id", nullable = false)
	private Meeting lastMeeting;
}
