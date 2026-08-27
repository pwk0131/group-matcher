package com.bookend.backend.engine;

import com.bookend.backend.entity.EncounterHistory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HistoryMatrix {
	// Key: "작은ID_큰ID", Value: 마지막 만남 회차
	private final Map<String, Integer> matrix = new HashMap<>();

	public HistoryMatrix(List<EncounterHistory> histories) {
		for (EncounterHistory h : histories) {
			String key = generateKey(h.getMemberA().getMemberId(), h.getMemberB().getMemberId());
			matrix.put(key, h.getLastMeeting().getRoundNumber());
		}
	}

	// 두 사람의 마지막 만남과 현재 회차의 차이(Delta T) 반환
	public int getDeltaT(Long id1, Long id2, int currentRound) {
		String key = generateKey(id1, id2);
		Integer lastRound = matrix.get(key);

		if (lastRound == null) {
			return -1; // 만난 적 없음
		}
		return currentRound - lastRound;
	}

	// ID 순서가 바뀌어도 항상 같은 키를 반환하도록 정렬
	private String generateKey(Long id1, Long id2) {
		long min = Math.min(id1, id2);
		long max = Math.max(id1, id2);
		return min + "_" + max;
	}
}