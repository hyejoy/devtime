import { API } from '@/constants/endpoints';
import { ApiResponse } from '@/types/api/helpers';

export const rankingService = {
  /**--- 랭킹 조회 ---- */
  getRankings: async (
    sortBy: 'total' | 'avg',
    page: number,
    limit: number
  ): Promise<ApiResponse<'/api/rankings', 'get'>> => {
    const response = await fetch(`${API.RANKING.GET({ sortBy, page, limit })}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) throw new Error('랭킹 조회 실패');

    const data = await response.json();
    return data;
  },
};
