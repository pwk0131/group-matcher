package com.bookend.backend.controller;

import com.bookend.backend.dto.LoginRequest;
import com.bookend.backend.entity.Admin;
import com.bookend.backend.repository.AdminRepository;
import com.bookend.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

	private final AdminRepository adminRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request) {

		Admin admin = adminRepository.findById(request.username()).orElse(null);

		if (admin != null && passwordEncoder.matches(request.password(), admin.getPassword())) {
			String token = jwtUtil.generateToken(admin.getUsername());

			return ResponseEntity.ok(Map.of("token", token));
		}

		// 실패 시 401 Unauthorized 에러 반환
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다.");
	}
}