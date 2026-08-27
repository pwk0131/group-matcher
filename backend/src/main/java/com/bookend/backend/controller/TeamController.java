package com.bookend.backend.controller;

import com.bookend.backend.dto.TeamFormationRequest;
import com.bookend.backend.engine.Team;
import com.bookend.backend.service.TeamFormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 향후 프론트엔드(React)에서 접속할 때 발생하는 CORS 에러 방지
public class TeamController {

	private final TeamFormationService teamService;

	// POST http://localhost:8080/api/teams/form
	@PostMapping("/form")
	public ResponseEntity<List<Team>> formTeams(@RequestBody TeamFormationRequest request) {
		List<Team> result = teamService.generateTeams(request);
		return ResponseEntity.ok(result);
	}
}