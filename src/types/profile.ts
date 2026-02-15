import { ProfileGetResponse, ProfilePostRequest } from '@/types/api';

// 1. 원본 profile 객체 타입 추출
export type ProfileField = NonNullable<ProfileGetResponse['profile']>;

// 2. 개별 필드 타입 재정의
export type ProfilePurpose = ProfileField['purpose'] | '';

// 💡 기술 스택을 객체 배열 타입으로 정의
export interface TechStackItem {
  id: string | number;
  name: string;
}
export type ProfileTechStacks = TechStackItem[];

// 3. 최종 Profile 인터페이스 구성 (Override)
export interface Profile extends Omit<ProfileGetResponse, 'profile'> {
  profile: Omit<ProfileField, 'purpose' | 'techStacks'> & {
    purpose: ProfilePurpose;
    techStacks: ProfileTechStacks; // 💡 string[] 대신 객체 배열로 교체
  };
}

// 4. 전역 상태 업데이트를 위한 핸들러 타입
export type OnChangeType = <K extends keyof ProfilePostRequest>(
  key: K,
  value: ProfilePostRequest[K]
) => void;

export type UpdateProfileResType = {
  nickname: string;
  career: string;
  purpose: string;
  goal: string;
  techStacks: string[];
  profileImage: string;
  password: string;
};
