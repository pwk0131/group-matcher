package com.bookend.backend.repository;

import com.bookend.backend.entity.EncounterHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EncounterHistoryRepository extends JpaRepository<EncounterHistory, Long> {

	// 조 편성에 참여하는 회원들의 과거 만남 이력 중, 기준 회차(thresholdRound) 이후의 기록만 조회
	@Query("SELECT e FROM EncounterHistory e " +
		"JOIN FETCH e.lastMeeting m " +
		"WHERE m.roundNumber >= :thresholdRound " +
		"AND e.memberA.memberId IN :memberIds " +
		"AND e.memberB.memberId IN :memberIds")
	List<EncounterHistory> findRecentHistories(@Param("memberIds") List<Long> memberIds,
		@Param("thresholdRound") int thresholdRound);

	Optional<EncounterHistory> findByMemberA_MemberIdAndMemberB_MemberId(Long memberAId, Long memberBId);

	void deleteByLastMeeting_MeetingId(Long meetingId);
}
