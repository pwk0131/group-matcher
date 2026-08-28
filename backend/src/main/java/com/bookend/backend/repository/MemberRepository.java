package com.bookend.backend.repository;

import com.bookend.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
	// 현재 활동 중인 회원만 모두 조회
	List<Member> findAllByInactiveFalse();
}
