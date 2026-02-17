'use client';

import Button from '@/app/components/ui/Button';
import { profileService } from '@/services/profileService';
import { useProfileStore } from '@/store/profileStore';
import { ProfilePostRequest } from '@/types/api';
import { ApiRequest } from '@/types/api/helpers';
import { Profile, ProfilePostRes } from '@/types/profile';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function ProfileSaveButton() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { nickname } = useProfileStore();
  const { career, purpose, goal, techStacks, profileImage } = profile;

  const handleSaveProfile = async () => {
    const body: ProfilePostRes = {
      career: career,
      purpose: purpose,
      goal: goal || '',
      techStacks: techStacks,
      profileImage: profileImage || '',
    };
    console.log('🛫🛫🛫', body);
    try {
      const res = await profileService.create(body);
      console.log('♥️ 저장되었습니다! . ', res);
      router.replace('/timer');
    } catch (err) {
      console.log('회원정보 저장 에러:', err);
    }
  };
  return (
    <Button onClick={handleSaveProfile} className="mb-4">
      저장하기
    </Button>
  );
}
