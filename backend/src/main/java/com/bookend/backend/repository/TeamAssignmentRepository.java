package com.bookend.backend.repository;

import com.bookend.backend.entity.TeamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamAssignmentRepository extends JpaRepository<TeamAssignment, Long> {
	List<TeamAssignment> findByMeeting_MeetingId(Long meetingId);
	void deleteByMeeting_MeetingId(Long meetingId);
}