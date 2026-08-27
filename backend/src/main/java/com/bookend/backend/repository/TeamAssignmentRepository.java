package com.bookend.backend.repository;

import com.bookend.backend.entity.TeamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamAssignmentRepository extends JpaRepository<TeamAssignment, Long> {
}