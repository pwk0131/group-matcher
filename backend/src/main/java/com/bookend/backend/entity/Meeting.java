package com.bookend.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Meeting {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long meetingId;

	@Column(nullable = false)
	private LocalDate meetingDate;

	@Column(nullable = false)
	private int roundNumber; // 기수 내 모임 회차 (예: 1, 2, 3...)
}
