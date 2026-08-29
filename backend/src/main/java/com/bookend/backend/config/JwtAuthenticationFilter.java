package com.bookend.backend.config;

import com.bookend.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {

		String token = null;

		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("adminToken".equals(cookie.getName())) {
					token = cookie.getValue();
					break;
				}
			}
		}

		if (token != null && jwtUtil.validateToken(token)) {
			String username = jwtUtil.extractUsername(token);

			UsernamePasswordAuthenticationToken authentication =
				new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}

		filterChain.doFilter(request, response);
	}
}