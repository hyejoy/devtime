'use client';

import { ChangeEvent, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { XIcon } from 'lucide-react';

import ProfileImage from '@/app/components/profileSetup/ProfileImage';
import SearchTechStack from '@/app/components/profileSetup/SearchTechStack';
import { NicknameField, PasswordGroup } from '@/app/components/signup/SignupFields';
import Button from '@/app/components/ui/Button';
import LoadingBar from '@/app/components/ui/LoadingBar';
import { SelectBox } from '@/app/components/ui/SelectBox';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';

import { passwordRegex } from '@/constants/regex';
import { CAREER_OPTIONS, PURPOSE_OPTIONS } from '@/constants/selectbox';
import { MESSAGE } from '@/constants/signupMessage';
import { S3_BASE_URL } from '@/constants/urls';
import { profileService } from '@/services/profileService';
import { signupService } from '@/services/signupService';
import { useProfileActions, useProfileStore } from '@/store/profileStore';
import { ProfileField } from '@/types/profile';
import { SignInput } from '@/types/signup';
import EditProfileConfirmDialog from '@/app/components/dialog/profile/EditProfileConfirmDialog';
import { useDialogStore } from '@/store/dialogStore';
import EditSuccessDialog from '@/app/components/dialog/profile/EditSuccessDialog';
import { useRouter } from 'next/navigation';

type ValuesField = Omit<SignInput, 'id'> & { goal: string };
type BaseValue = Omit<ValuesField, 'goal'>;

export default function Page() {
  const router = useRouter();
  const { profile, nickname: storeNickname } = useProfileStore();
  const { setProfile, setNickname } = useProfileActions();
  const { isOpen, openDialog, closeDialog } = useDialogStore();

  const [isReverting, setIsReverting] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Input Values
  const [values, setValues] = useState<ValuesField>({
    nickname: storeNickname,
    password: '',
    checkPassword: '',
    goal: profile.goal || '',
  });

  // Feedback & Validity
  const [feedbackMessage, setFeedbackMessage] = useState<BaseValue>({
    nickname: '',
    password: '',
    checkPassword: '',
  });
  const [passwordValidity, setPasswordValidity] = useState({
    password: true,
    checkPassword: true,
  });

  const inputRefs = {
    nickname: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    checkPassword: useRef<HTMLInputElement>(null),
  };

  /** 1. 유효성 검사 헬퍼 함수 */
  const validateField = (name: keyof ValuesField, value: string, isCheck?: boolean) => {
    switch (name) {
      case 'nickname':
        if (!value) return MESSAGE.REQUIRED.nickname;
        if (!isCheck) return MESSAGE.NICKNAME_DUPLICATE_REQUIRED;
        return MESSAGE.NICKNAME_AVAILABLE;
      case 'password':
        if (!value) return MESSAGE.PASSWORD_INVALID;
        return passwordRegex.test(value) ? '' : MESSAGE.PASSWORD_INVALID;
      case 'checkPassword':
        return value === values.password ? '' : MESSAGE.PASSWORD_MISMATCH;
      default:
        return '';
    }
  };

  /** 2. 핸들러 함수들 */
  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>, name: keyof ValuesField) => {
    const nextValue = e.target.value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));

    if (name === 'nickname') {
      setNicknameCheck(false);
      setFeedbackMessage((prev) => ({ ...prev, nickname: MESSAGE.NICKNAME_DUPLICATE_REQUIRED }));
    } else if (name === 'password' || name === 'checkPassword') {
      const isValid =
        name === 'password' ? passwordRegex.test(nextValue) : nextValue === values.password;
      setPasswordValidity((prev) => ({ ...prev, [name]: isValid }));
      setFeedbackMessage((prev) => ({ ...prev, [name]: validateField(name, nextValue) }));
    } else if (name === 'goal') {
      setProfile('goal', nextValue);
    }
  };

  const handleNicknameVerify = async () => {
    const res = await signupService.checkNickname(values.nickname);
    if (res.available) {
      setNicknameCheck(true);
      setFeedbackMessage((prev) => ({ ...prev, nickname: MESSAGE.NICKNAME_AVAILABLE }));
    }
  };

  const profileBody = {
    nickname: values.nickname, // 닉네임은 상위 필드지만 API 스펙에 따라 포함
    career: profile.career as any,
    purpose: profile.purpose as any,
    techStacks: profile.techStacks,
    goal: profile.goal,
    profileImage: profile.profileImage || '',
    password: values.password,
  };

  const saveProfile = async () => {
    try {
      // 1. 일단 업데이트(PUT) 시도
      closeDialog();
      await profileService.update(profileBody);
      setUpdateSuccess(true);
      openDialog();
    } catch (err: any) {
      // 2. 만약 "프로필이 존재하지 않습니다" (400) 에러라면 생성(POST) 시도
      if (err.message.includes('실패')) {
        try {
          await profileService.create(profileBody);
        } catch (createErr) {
          console.error('프로필 생성 실패:', createErr);
        }
      } else {
        alert(err.message || '저장 중 오류가 발생했습니다.');
      }
    }
  };
  const revertChanges = async () => {
    try {
      setIsReverting(true);
      const data = await profileService.get();

      setValues({
        nickname: data.nickname,
        goal: data.profile?.goal || '',
        password: '',
        checkPassword: '',
      });
      setFeedbackMessage({ nickname: '', password: '', checkPassword: '' });

      // Zustand Store 일괄 복구
      const p = data.profile;
      setProfile('purpose', p?.purpose || '');
      setProfile('goal', p?.goal || '');
      setProfile('career', p?.career || '');
      setProfile('techStacks', p?.techStacks || []);
      setProfile('profileImage', p?.profileImage || '');
    } catch (error) {
      console.error('복구 실패', error);
    } finally {
      setIsReverting(false);
    }
  };

  // 저장 완료 후 닫는 로직
  const handleCloseDialog = () => {
    Object.entries(profileBody).forEach(([key, value]) => {
      if (key === 'nickname' || key === 'password') return;
      setProfile(key as keyof ProfileField, value);
    });

    setNickname(values.nickname);
    setUpdateSuccess(false); // 다이얼로그가 닫힐 때 성공 상태도 초기화
  };

  // 저장 버튼 비활성화 로직
  const isSaveDisabled =
    !nicknameCheck || // 닉네임 중복확인 미완료
    !values.nickname || // 닉네임 빈값
    !values.password || // 비밀번호 빈값
    !passwordValidity.password || // 비밀번호 유효성 미통과
    values.password !== values.checkPassword || // 비밀번호 불일치
    !profile.purpose || // 공부 목적 미선택
    !profile.career || // 개발 경력 미선택
    !profile.goal || // 공부 목표 빈값
    !profile.profileImage || // 프로필이미지 빈값
    profile.techStacks.length === 0; // 기술 스택이 비어있음

  if (isReverting) return <LoadingBar />;

  return (
    <>
      <div className="mt-10 flex w-full flex-col justify-start rounded-lg bg-white p-9">
        {/* 📸 프로필 이미지 섹션 */}
        <section className="mb-9">
          <div className="mt-2">
            {profile.profileImage ? (
              <>
                <TextLabel label="프로필 이미지" name="profileImage" />
                <div className="relative h-[120px] w-[120px] overflow-hidden rounded-md border border-gray-200">
                  <Image
                    src={`${S3_BASE_URL}/${profile.profileImage}`}
                    alt="profile"
                    fill
                    className="object-contain"
                  />
                  <XIcon
                    className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-red-500"
                    onClick={() => setProfile('profileImage', '')}
                  />
                </div>
              </>
            ) : (
              <ProfileImage />
            )}
          </div>
        </section>

        {/* 📝 정보 입력 섹션 */}
        <section className="mb-9 grid grid-cols-2 gap-16">
          <div className="flex flex-col gap-6">
            <NicknameField
              value={values.nickname}
              isValid={nicknameCheck}
              isDuplicateChecked={nicknameCheck}
              feedback={feedbackMessage.nickname}
              onChange={handleFieldChange}
              onConfirm={handleNicknameVerify}
              inpurRef={inputRefs.nickname}
            />
            <SelectBox
              keyType="purpose"
              label="공부 목적"
              options={PURPOSE_OPTIONS}
              value={profile.purpose || ''}
              onChange={(key, val) => setProfile(key, val as any)}
              placeholder="공부의 목적을 선택해 주세요."
            />
            <PasswordGroup
              inputRefs={inputRefs}
              values={values}
              validity={passwordValidity}
              feedback={feedbackMessage}
              onChange={handleFieldChange}
              passwordLabel="새 비밀번호"
              checkPasswordLabel="새 비밀번호 재입력"
            />
          </div>

          <div className="flex flex-col gap-6">
            <SelectBox
              keyType="career"
              label="개발 경력"
              options={CAREER_OPTIONS}
              value={profile.career || ''}
              onChange={(key, val) => setProfile(key, val as any)}
              placeholder="개발 경력을 선택해주세요."
            />
            <div>
              <TextLabel name="goal" label="공부 목표" />
              <TextFieldInput
                name="goal"
                value={profile.goal || ''}
                placeholder="공부 목표를 입력해 주세요."
                onChange={(e) => handleFieldChange(e, 'goal')}
              />
            </div>
            <SearchTechStack />
          </div>
        </section>

        <footer className="flex justify-end gap-4">
          <Button variant="secondary" onClick={revertChanges}>
            취소
          </Button>
          <Button onClick={openDialog} disabled={isSaveDisabled}>
            변경 사항 저장하기
          </Button>
        </footer>
      </div>
      {isOpen &&
        (updateSuccess ? (
          <EditSuccessDialog onClick={handleCloseDialog} />
        ) : (
          <EditProfileConfirmDialog onClickSaveButton={saveProfile} />
        ))}
    </>
  );
}
