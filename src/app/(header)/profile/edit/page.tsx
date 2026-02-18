'use client';

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
import { DuplicateState, SignField, SignInput, SignValid } from '@/types/signup';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

export default function Page() {
  type ValuesField = Omit<SignInput, 'id'> & {
    goal: string;
  };

  type BaseValue = Omit<ValuesField, 'goal'>;
  const { profile, nickname } = useProfileStore();
  const { career, purpose, techStacks, goal, profileImage } = profile;
  const { setProfile } = useProfileActions();
  const inputRefs = {
    nickname: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    checkPassword: useRef<HTMLInputElement>(null),
  };
  const [isReverting, setIsReverting] = useState(false);
  //  input values
  const [values, setValues] = useState<ValuesField>({
    nickname: nickname,
    password: '',
    checkPassword: '',
    goal: profile.goal || '',
  });

  /* duplicate check */
  const [nicknameCheck, setNicknameCheck] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<BaseValue>({
    nickname: '',
    password: '',
    checkPassword: '',
  });

  const [passwordValidity, setPasswordValidity] = useState({
    password: true,
    checkPassword: true,
  });

  // feedbackMessage 업데이트
  const updateFieldMessage = (name: keyof ValuesField, value: string) => {
    setFeedbackMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 비밀번호 유효성검사 업데이트
  const updateValiditiy = (name: keyof Omit<ValuesField, 'nickname'>, value: boolean) => {
    setPasswordValidity((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  HELPER MESSAGE 변경
  const handleFeedbackMessage = useCallback(
    (
      name: keyof ValuesField, //field
      isDuplicateConfirmed: boolean //중복(id,nick)
    ) => {
      const value = values[name];

      switch (name) {
        case 'nickname': {
          if (!value) {
            updateFieldMessage(name, MESSAGE.REQUIRED.nickname);
            return;
          }

          if (!isDuplicateConfirmed) {
            updateFieldMessage(name, MESSAGE.NICKNAME_DUPLICATE_REQUIRED);
            return;
          }

          updateFieldMessage(
            name,
            isDuplicateConfirmed ? MESSAGE.NICKNAME_AVAILABLE : MESSAGE.NICKNAME_DUPLICATED
          );
          return;
        }

        case 'password': {
          if (!value) {
            updateFieldMessage(name, MESSAGE.PASSWORD_INVALID);
            return;
          }
          const isValid = passwordRegex.test(values.password);
          updateFieldMessage('password', isValid ? '' : MESSAGE.PASSWORD_INVALID);

          updateFieldMessage(
            'checkPassword',
            value === values.checkPassword ? '' : MESSAGE.PASSWORD_MISMATCH
          );
          return;
        }

        case 'checkPassword': {
          if (!value || value !== values.password) {
            updateFieldMessage(name, MESSAGE.PASSWORD_MISMATCH);
            return;
          } else {
            updateFieldMessage(name, '');
            return;
          }
        }
      }
    },
    [MESSAGE, passwordRegex, updateFieldMessage, values.password, values.checkPassword]
  );

  const handleFieldChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, name: keyof ValuesField) => {
      setValues((prev) => {
        const next = { ...prev, [name]: e.target.value };

        //  필드별 유효성 계산
        const fieldValidMap: Record<keyof BaseValue, boolean> = {
          nickname: nicknameCheck,
          password: passwordRegex.test(next.password),
          checkPassword: next.checkPassword.length > 0 && next.checkPassword === next.password,
        };

        if (name !== 'goal') {
          const isValid = fieldValidMap[name];

          // 중복확인 상태 리셋
          if (name === 'nickname') {
            setNicknameCheck(false);
            handleFeedbackMessage(name, false);
          } else if (name === 'password' || name === 'checkPassword') {
            handleFeedbackMessage(name, isValid);
            updateValiditiy(name, isValid);
          }
        }

        if (name === 'goal') {
          // zustand 업데이트
          setProfile('goal', e.target.value);
        }

        return next;
      });
    },
    [nicknameCheck, handleFeedbackMessage]
  );
  // 닉네임, 공부목적, 경력 등 문자열 값을 가지는 키들만 타겟팅
  const handleChangeSelectedBox = (keytype: keyof ProfileField, value: string) => {
    // 여기서 value는 string임이 보장되므로 setProfile 호출 시 타입 에러가 사라집니다.
    setProfile(keytype, value as any);
  };

  const handleNicknameVerify = async () => {
    const res = await signupService.checkNickname(values.nickname);
    if (res.available) {
      setNicknameCheck(true);
      handleFeedbackMessage('nickname', true);
    }

    console.log('닉네임 중복 확인 결과 : ', res);
  };

  const removeProfileImage = () => {
    setProfile('profileImage', '');
  };

  const saveProfile = async () => {
    try {
      const res = await profileService.update({
        nickname,
        purpose,
        techStacks,
        career,
        password: values.password,
        profileImage: profileImage || '',
      });
    } catch (err) {
      console.error('프로필 업데이트 실패 : ', err);
    }
  };

  const revertChanges = async () => {
    try {
      setIsReverting(true); // 로딩 시작

      // 서버에서 최신(원본) 데이터를 다시 가져옴
      const originalData = await profileService.get();

      // 여기서는 기존에 store에 저장된 초기값을 다시 로드하는 로직이 필요합니다.

      // 1. Local State 초기화
      setValues({
        nickname: originalData.nickname,
        goal: originalData.profile?.goal || '',
        password: '',
        checkPassword: '',
      });
      setFeedbackMessage({
        nickname: '',
        password: '',
        checkPassword: '',
      });
      setProfile('purpose', originalData.profile?.purpose || '');
      setProfile('goal', originalData.profile?.goal || '');
      setProfile('career', originalData.profile?.career || '');
      setProfile('techStacks', originalData.profile?.techStacks || []);
      setProfile('profileImage', originalData.profile?.profileImage);

      // 2. 만약 API 없이 Store만 원복하고 싶다면,
      // 페이지 진입 시 데이터를 별도의 'initialProfile'로 저장해두었다가 꺼내쓰는 게 베스트입니다.
    } catch (error) {
      console.error('복구 실패', error);
    } finally {
      setIsReverting(false); // 로딩 종료
    }
  };

  if (isReverting) {
    return <LoadingBar />;
  }
  return (
    <div className="mt-10 flex w-full flex-col justify-start rounded-lg bg-white p-9">
      <section>
        {/* 프로필 이미지 */}
        {profile.profileImage && (
          <div className="mb-9 flex flex-col gap-2">
            <TextLabel label="프로필 이미지" name="profileImage" />

            {/* 140x140 고정 컨테이너 */}
            <div className="relative h-[140px] w-[140px] overflow-hidden rounded-md border border-gray-200">
              <Image
                src={`${S3_BASE_URL}/${profile.profileImage}`}
                alt="profile Image"
                fill
                sizes="120px"
                className="relative object-contain"
                priority
              />
              <XIcon
                className="absolute top-[8px] right-[8px] z-50 cursor-pointer text-gray-400 hover:text-red-400"
                onClick={removeProfileImage}
              />
            </div>
          </div>
        )}
        {!profile.profileImage && <ProfileImage />}
      </section>
      <section className="mb-9 grid grid-cols-2 gap-16">
        <div>
          <NicknameField
            value={values.nickname}
            isValid={nicknameCheck}
            isDuplicateChecked={nicknameCheck}
            feedback={feedbackMessage.nickname}
            onChange={handleFieldChange}
            onConfirm={handleNicknameVerify}
            inpurRef={inputRefs.nickname}
          />
          <div className="mb-9">
            <SelectBox
              keyType="purpose"
              label="공부 목적"
              placeholder="공부의 목적을 선택해 주세요."
              value={profile?.purpose || ''}
              options={PURPOSE_OPTIONS}
              onChange={handleChangeSelectedBox}
            />
          </div>
          <PasswordGroup
            inputRefs={inputRefs}
            values={values}
            validity={passwordValidity}
            feedback={feedbackMessage}
            onChange={handleFieldChange}
            passwordLabel={'새 비밀번호'}
            checkPasswordLabel={'새 비밀번호 재입력'}
            passwordPlaceholder={MESSAGE.PROFILE.PASSWORD_EDIT}
            checkPasswordPlaceholder={MESSAGE.PROFILE.CHECKPASSWORD_MISMATCH}
          />
        </div>

        <div className="flex flex-col gap-6">
          <SelectBox
            keyType="career"
            label="개발 경력"
            placeholder="개발 경력을 선택해주세요"
            value={profile?.career || ''}
            options={CAREER_OPTIONS}
            onChange={handleChangeSelectedBox}
          />

          <div>
            <TextLabel name="goal" label="공부 목표" />
            <TextFieldInput
              name="goal"
              value={profile?.goal || ''}
              placeholder="공부 목표를 입력해 주세요."
              onChange={(e) => handleFieldChange(e, 'goal')}
            />
          </div>
          <SearchTechStack />
        </div>
      </section>
      <section className="flex justify-end gap-4">
        {/* 버튼 */}
        <Button variant="secondary" onClick={revertChanges}>
          취소
        </Button>
        <Button onClick={saveProfile}>변경 사항 저장하기</Button>
      </section>
    </div>
  );
}
