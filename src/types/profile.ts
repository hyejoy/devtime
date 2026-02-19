import { ProfileGetResponse, ProfilePostRequest } from '@/types/api';
import { ApiRequest } from '@/types/api/helpers';

// 1. 원본 profile 객체 타입 추출
export type OriginProfileField = NonNullable<ProfileGetResponse['profile']>;

export interface ProfileField extends Omit<OriginProfileField, 'carrer' | 'purpose'> {
  career: OriginProfileField['career'] | '';
  purpose: OriginProfileField['purpose'] | '';
}
// 2. 개별 필드 타입 재정의
export type ProfilePurpose = OriginProfileField['purpose'] | '';

// 3. 최종 Profile 인터페이스 구성 (Override)
export interface Profile extends Omit<ProfileGetResponse, 'profile'> {
  profile: ProfilePostRes;
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

export type TechStackItem = {
  id: number;
  name: string;
};

// 1. 원본 타입 가져오기
type OriginalPostRequest = ApiRequest<'/api/profile', 'post'>;

// 2. 특정 필드(career, purpose)에 빈 문자열("")을 허용하도록 개조
export type ProfilePostRes = Omit<OriginalPostRequest, 'career' | 'purpose'> & {
  career: OriginalPostRequest['career'] | '';
  purpose: ClientProfilePostRequest['purpose'] | '';
};

/** * 클라이언트 화면 로직을 위해 'purpose'에 "기타" 문자열을 추가한 확장 타입
 */
export type ClientProfilePostRequest = Omit<OriginalPostRequest, 'purpose'> & {
  purpose: OriginalPostRequest['purpose'] | '기타';
};
