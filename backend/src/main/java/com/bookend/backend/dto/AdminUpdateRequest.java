package com.bookend.backend.dto;

public record AdminUpdateRequest(
	String currentPassword,
	String newUsername,
	String newPassword
) {}