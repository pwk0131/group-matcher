package com.bookend.backend.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
	private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
	// 토큰 유효 시간: 24시간
	private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

	public String generateToken(String username) {
		return Jwts.builder()
			.setSubject(username) // 토큰의 주인 (admin)
			.setIssuedAt(new Date()) // 발급 시간
			.setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 만료 시간
			.signWith(key) // 위조 방지 서명
			.compact(); // 압축하여 문자열로 반환
	}
}