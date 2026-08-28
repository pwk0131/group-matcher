package com.bookend.backend.controller;

import com.bookend.backend.entity.Member;
import com.bookend.backend.entity.RoleType;
import com.bookend.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

	private final MemberRepository memberRepository;

	// 모든 부원 조회 (가나다 순)
	@GetMapping
	public List<Member> getAllMembers() {
		return memberRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
	}

	// 신규 부원 추가
	@PostMapping
	@Transactional
	public Member addMember(@RequestBody Member newMember) {
		return memberRepository.save(newMember); // DB에 저장하고, 생성된 ID가 포함된 결과 반환
	}

	// 부원 정보 부분 수정 (출석, 역할 등)
	@PatchMapping("/{id}")
	@Transactional
	public ResponseEntity<?> updateMember(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
		Member member = memberRepository.findById(id).orElseThrow();
		String field = (String) updates.get("field");
		Object value = updates.get("value");

		switch (field) {
			case "roleType" -> member.setRoleType(RoleType.valueOf((String) value));
			case "attendanceCount" -> member.setAttendanceCount((Integer) value);
			case "isFacilitator" -> member.setFacilitator((Boolean) value);
			case "isInactive" -> member.setInactive((Boolean) value);
		}
		return ResponseEntity.ok().build();
	}

	// 부원 완전 삭제
	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<?> deleteMember(@PathVariable Long id) {
		memberRepository.deleteById(id);
		return ResponseEntity.ok().build();
	}
}