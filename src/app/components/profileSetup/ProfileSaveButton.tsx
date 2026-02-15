'use client';

import Button from '@/app/components/ui/Button';
import { profileService } from '@/services/profileService';
import { useProfileStore } from '@/store/profileStore';
import { useCallback } from 'react';

export default function ProfileSaveButton() {
  const { profile } = useProfileStore();

  // 전체 저장하기
  const SaveButton = useCallback(() => {
    return (
      <Button onClick={handleSaveProfile} className="mb-4">
        저장하기
      </Button>
    );
  }, []);

  const handleSaveProfile = async () => {
    const { career, purpose, goal, techStacks, profileImage } = profile;
    const bodyTechStacks = techStacks.map((tech) => tech.name);
    let bodyPurpose: string;
    if (typeof purpose === 'object') {
      bodyPurpose = purpose.detail;
    } else {
      bodyPurpose = purpose;
    }
    const body = {
      nickname: '',
      career: career || '',
      purpose: bodyPurpose || '',
      techStacks: bodyTechStacks,
      profileImage: profileImage || '',
      password: '',
    };
    console.log('🛫🛫🛫', body);
    try {
      const res = await profileService.update(body);
      console.log('♥️ 저장되었습니다! . ', res);
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
