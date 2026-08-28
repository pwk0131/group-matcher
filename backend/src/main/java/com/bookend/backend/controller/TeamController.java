package com.bookend.backend.controller;

import com.bookend.backend.dto.TeamFormationRequest;
import com.bookend.backend.dto.TeamSaveRequest;
import com.bookend.backend.engine.Team;
import com.bookend.backend.service.TeamFormationService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

	private final TeamFormationService teamService;

	// POST http://localhost:8080/api/teams/form
	@PostMapping("/form")
	public ResponseEntity<List<Team>> formTeams(@RequestBody TeamFormationRequest request) {
		List<Team> result = teamService.generateTeams(request);
		return ResponseEntity.ok(result);
	}

	@PostMapping("/save")
	public ResponseEntity<?> saveTeams(@RequestBody TeamSaveRequest request) {
		teamService.saveTeams(request);
		return ResponseEntity.ok(Map.of("message", "조 편성이 성공적으로 저장되었습니다!"));
	}
}