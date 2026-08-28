package com.bookend.backend.controller;

import com.bookend.backend.entity.Meeting;
import com.bookend.backend.entity.Member;
import com.bookend.backend.entity.TeamAssignment;
import com.bookend.backend.repository.EncounterHistoryRepository;
import com.bookend.backend.repository.MeetingRepository;
import com.bookend.backend.repository.TeamAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

	private final MeetingRepository meetingRepository;
	private final TeamAssignmentRepository teamAssignmentRepository;
	private final EncounterHistoryRepository encounterHistoryRepository;

	@GetMapping
	public ResponseEntity<?> getHistory() {
		// 최신 회차부터 내림차순 정렬하여 불러옴
		List<Meeting> meetings = meetingRepository.findAll(Sort.by(Sort.Direction.DESC, "roundNumber"));
		List<Map<String, Object>> result = new ArrayList<>();

		for (Meeting meeting : meetings) {
			List<TeamAssignment> assignments = teamAssignmentRepository.findByMeeting_MeetingId(meeting.getMeetingId());

			Map<String, List<String>> teamsMap = new LinkedHashMap<>();
			for (TeamAssignment ta : assignments) {
				teamsMap.computeIfAbsent(ta.getTeamName(), k -> new ArrayList<>())
					.add(ta.getMember().getName());
			}

			result.add(Map.of(
				"meetingId", meeting.getMeetingId(),
				"roundNumber", meeting.getRoundNumber(),
				"meetingDate", meeting.getMeetingDate(),
				"teams", teamsMap
			));
		}
		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/{meetingId}")
	@Transactional
	public ResponseEntity<?> deleteHistory(@PathVariable Long meetingId) {

		Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();

		if (meeting.getRoundNumber() > 0) {
			List<TeamAssignment> assignments = teamAssignmentRepository.findByMeeting_MeetingId(meetingId);
			for (TeamAssignment ta : assignments) {
				Member member = ta.getMember();
				member.setAttendanceCount(Math.max(0, member.getAttendanceCount() - 1));
			}
		}

		teamAssignmentRepository.deleteByMeeting_MeetingId(meetingId);
		encounterHistoryRepository.deleteByLastMeeting_MeetingId(meetingId);
		meetingRepository.deleteById(meetingId);

		return ResponseEntity.ok().build();
	}
}