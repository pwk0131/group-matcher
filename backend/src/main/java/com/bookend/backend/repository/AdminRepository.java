package com.bookend.backend.repository;

import com.bookend.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminRepository extends JpaRepository<Admin, String> {

	@Modifying
	@Query("UPDATE Admin a SET a.username = :newUsername, a.password = :newPassword WHERE a.username = :oldUsername")
	void updateAdminInfo(@Param("oldUsername") String oldUsername, @Param("newUsername") String newUsername, @Param("newPassword") String newPassword);
}