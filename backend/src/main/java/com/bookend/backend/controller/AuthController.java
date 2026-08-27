package com.bookend.backend.controller;

import com.bookend.backend.dto.LoginRequest;
import com.bookend.backend.entity.Admin;
import com.bookend.backend.repository.AdminRepository;
import com.bookend.backend.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AdminRepository adminRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
		Admin admin = adminRepository.findById(request.username()).orElse(null);

		if (admin != null && passwordEncoder.matches(request.password(), admin.getPassword())) {
			String token = jwtUtil.generateToken(admin.getUsername());

			Cookie cookie = new Cookie("adminToken", token);
			cookie.setHttpOnly(true);
			cookie.setPath("/");
			cookie.setMaxAge(60 * 60 * 24);
			// cookie.setSecure(true); // HTTPS를 사용할 때는 주석 해제 (현재는 로컬 테스트라 생략)

			response.addCookie(cookie);

			return ResponseEntity.ok(Map.of("message", "로그인 성공"));
		}

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 틀렸습니다.");
	}
}