package com.bookend.backend.dto;

import com.bookend.backend.engine.Team;
import java.util.List;

public record TeamFormationResponse(List<Team> teams, List<String> logs) {}