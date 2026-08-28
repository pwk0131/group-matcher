package com.bookend.backend.repository;

import com.bookend.backend.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
	Optional<Meeting> findByRoundNumber(int roundNumber);
}