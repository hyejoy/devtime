import { API } from '@/constants/endpoints';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';

// services/timerService.ts
export const timerService = {
  /**--- 타이머 시작 ---- */
  start: async (
    body: ApiRequest<'/api/timers', 'post'>
  ): Promise<ApiResponse<'/api/timers', 'post', 201>> => {
    const res = await fetch(`${API.TIMER.START}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('시작 실패');

    const data = await res.json();

    return data;
  },

  /*--- 타이머 업데이트 ----*/
  update: async (
    timerId: string,
    body: ApiRequest<'/api/timers/{timerId}', 'put'>
  ): Promise<ApiResponse<'/api/timers/{timerId}', 'put'>> => {
    const res = await fetch(`${API.TIMER.UPDATE(timerId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('업데이트 실패');
    const data = await res.json();
    return data;
  },

  /*--- 타이머 정지 ----*/
  stop: async (
    timerId: string,
    body: ApiRequest<'/api/timers/{timerId}/stop', 'post'>
  ): Promise<ApiResponse<'/api/timers/{timerId}/stop', 'post'>> => {
    const res = await fetch(`${API.TIMER.STOP(timerId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('타이머 정지 실패');

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return {} as any;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as any);
  },

  /*--- 타이머 삭제 ----*/
  delete: async (timerId: string): Promise<ApiResponse<'/api/timers/{timerId}', 'delete'>> => {
    const res = await fetch(`${API.TIMER.DELETE(timerId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('타이머 삭제 실패');

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return {} as any;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : ({} as any);
  },

  /*--- 타이머 리스트 불러오기 ----*/
  getList: async (): Promise<ApiResponse<'/api/timers', 'get'>> => {
    const res = await fetch(`${API.TIMER.GETLIST}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('타이머 리스트 불러오기 실패');

    const data = await res.json();
    return data;
  },

  /*--- 타이머 진행 중일때 할 일 목록 전체 업데이트---*/
  updateTasks: async (
    studyLogId: string,
    body: ApiRequest<'/api/{studyLogId}/tasks', 'put'>
  ): Promise<ApiRequest<'/api/{studyLogId}/tasks', 'put'>> => {
    const res = await fetch(`${API.TASK.UPDATE(studyLogId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'applicaton/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('할일 목록 업데이트 실패');

    const data = await res.json();
    return data;
  },
};
