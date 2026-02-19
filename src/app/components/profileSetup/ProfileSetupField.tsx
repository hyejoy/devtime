'use-client';

import ProfileImage from '@/app/components/profileSetup/ProfileImage';
import SearchTechStack from '@/app/components/profileSetup/SearchTechStack';
import { SelectBox } from '@/app/components/ui/SelectBox';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import { CAREER_OPTIONS, PURPOSE_OPTIONS } from '@/constants/selectbox';
import { useProfileStore } from '@/store/profileStore';
import { OnChangeType } from '@/types/profile';

export default function ProfileSetupField() {
  /** zustand */
  const { profile } = useProfileStore();
  const { setProfile } = useProfileStore((state) => state.actions);

  /** 공통 필드 변경 핸들러 */

  const handleFieldChange: OnChangeType = (key, value) => {
    setProfile(key, value);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 개발 경력 선택 */}
      <SelectBox
        keyType="career"
        label="개발 경력"
        placeholder="개발 경력을 선택해주세요"
        value={profile?.career || ''}
        options={CAREER_OPTIONS}
        onChange={handleFieldChange}
      />

      {/* 공부 목적 선택 */}
      <SelectBox
        keyType="purpose"
        label="공부 목적"
        placeholder="공부의 목적을 선택해 주세요."
        value={profile?.purpose || ''}
        options={PURPOSE_OPTIONS}
        onChange={handleFieldChange}
      />

      {/* 공부 목표 입력 */}
      <div>
        <TextLabel name="goal" label="공부 목표" />
        <TextFieldInput
          name="goal"
          value={profile?.goal || ''}
          placeholder="공부 목표를 입력해 주세요."
          onChange={(e) => handleFieldChange('goal', e.target.value)}
        />
      </div>
      {/* 기술 스택 검색 및 등록 섹션 */}
      <SearchTechStack />
      <ProfileImage />
    </div>
  );
}
