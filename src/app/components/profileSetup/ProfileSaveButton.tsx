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
    try {
      const res = await profileService.create(body);
      router.replace('/timer');
    } catch (err) {
      console.error('회원정보 저장 에러:', err);
    }
  };

  const handleActiveButton = () => {
    return Boolean(career && purpose && goal && techStacks.length > 0 && profileImage);
  };
  return (
    <Button onClick={handleSaveProfile} className="mb-4" disabled={!handleActiveButton()}>
      저장하기
    </Button>
  );
}
