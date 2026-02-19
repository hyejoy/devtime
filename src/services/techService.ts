import { API } from '@/constants/endpoints';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';
import { TechStackItem } from '@/types/profile';

export const techService = {
  get: async (searchText: string): Promise<ApiResponse<'/api/tech-stacks', 'get'>> => {
    const res = await fetch(`${API.TECHSTACK.GET(searchText)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('기술 스택 검색 실패');
    return await res.json(); // 자동으로 Promise 타입에 맞춰 추론됩니다.
  },

  update: async (
    body: ApiRequest<'/api/tech-stacks', 'post'>
  ): Promise<{
    message: string;
    techStack: TechStackItem & { createdAt: string; updatedAt: string };
  }> => {
    const res = await fetch(`${API.TECHSTACK.UPDATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('기술 스택 등록 실패');

    // 여기서 발생하는 'any' vs 'never' 에러를 방지하기 위해
    // 결과값을 명시적으로 캐스팅하여 리턴합니다.
    const data = await res.json();
    return data;
  },
};
