'use client';

import { ChangeEvent, useRef } from 'react';
import Button from '@/app/components/ui/Button';
import TextLabel from '@/app/components/ui/TextLabel';
import TextFieldInput from '../ui/TextFieldInput';
import { MESSAGE } from '@/constants/signupMessage';
import { DuplicateField, DuplicateState, SignField, SignInput, SignValid } from '@/types/signup';

/** ------------------------------------------------------------------------------
 * 1. 하위 컴포넌트 추출 (추상화)
 * 각 필드의 구체적인 로직(중복확인 조건, 라벨, 플레이스홀더 등)을 캡슐화합니다.
 * ------------------------------------------------------------------------------ */

// 아이디 필드
const IdField = ({
  value,
  isValid,
  isRegExpValid,
  isDuplicateChecked,
  feedback,
  onChange,
  onConfirm,
  inputRef,
}: any) => {
  const isIdConfirmDisabled = !value || !isRegExpValid || isDuplicateChecked;

  return (
    <div>
      <TextLabel name="id" label="아이디" />
      <div className="flex flex-row gap-2">
        <TextFieldInput
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e, 'id')}
          name="id"
          placeholder={MESSAGE.REQUIRED.id}
          feedbackMessage={feedback}
          isValid={isValid}
          hasFeedback={true}
          autoComplete="off"
        />
        <Button variant="secondary" disabled={isIdConfirmDisabled} onClick={() => onConfirm('id')}>
          중복확인
        </Button>
      </div>
    </div>
  );
};

// 닉네임 필드
export const NicknameField = ({
  value,
  isValid,
  isDuplicateChecked,
  feedback,
  onChange,
  onConfirm,
  inputRef,
}: any) => {
  const isNicknameConfirmDisabled = !value || isDuplicateChecked;

  return (
    <div>
      <TextLabel name="nickname" label="닉네임" />
      <div className="flex flex-row gap-2">
        <TextFieldInput
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e, 'nickname')}
          name="nickname"
          placeholder={MESSAGE.REQUIRED.nickname}
          feedbackMessage={feedback}
          isValid={isValid}
          hasFeedback={true}
          autoComplete="off"
        />
        <Button
          variant="secondary"
          disabled={isNicknameConfirmDisabled}
          onClick={() => onConfirm('nickname')}
        >
          중복확인
        </Button>
      </div>
    </div>
  );
};

// 비밀번호 그룹 (비밀번호 + 확인)
export const PasswordGroup = ({
  values,
  validity,
  feedback,
  onChange,
  inputRefs,
  passwordLabel = '비밀번호',
  checkPasswordLabel = '비밀번호 확인',
  passwordPlaceholder = MESSAGE.REQUIRED.password,
  checkPasswordPlaceholder = MESSAGE.REQUIRED.checkPassword,
}: any) => {
  return (
    <div className="flex flex-col">
      <div>
        <TextLabel name="password" label={passwordLabel} />
        <TextFieldInput
          ref={inputRefs.password}
          value={values.password}
          onChange={(e) => onChange(e, 'password')}
          name="password"
          type="password"
          placeholder={passwordPlaceholder}
          feedbackMessage={feedback.password}
          isValid={validity.password}
          hasFeedback={true}
          autoComplete="new-password"
        />
      </div>
      <div>
        <TextLabel name="checkPassword" label={checkPasswordLabel} />
        <TextFieldInput
          ref={inputRefs.checkPassword}
          value={values.checkPassword}
          onChange={(e) => onChange(e, 'checkPassword')}
          name="checkPassword"
          type="password"
          placeholder={checkPasswordPlaceholder}
          feedbackMessage={feedback.checkPassword}
          isValid={validity.checkPassword}
          hasFeedback={true}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

/** ------------------------------------------------------------------------------
 * 2. 메인 컴포넌트 (SignupFields)
 * 상세 로직은 숨기고 전체 필드의 나열(맥락)만 관리합니다.
 * ------------------------------------------------------------------------------ */

type Props = {
  values: SignInput;
  fieldValidity: SignValid;
  isDuplicateCheckedMap: DuplicateState;
  isRegexValidityMap: Pick<SignValid, 'id' | 'password'>;
  feedbackMessages: SignInput;
  onChangeValue: (name: keyof SignInput, value: string) => void;
  onConfirmDuplicate: (field: DuplicateField) => void;
};

export default function SignupFields({
  values,
  fieldValidity,
  isDuplicateCheckedMap,
  isRegexValidityMap,
  feedbackMessages,
  onChangeValue,
  onConfirmDuplicate,
}: Props) {
  const inputRefs = {
    id: useRef<HTMLInputElement>(null),
    nickname: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    checkPassword: useRef<HTMLInputElement>(null),
  } as const;

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>, key: SignField) => {
    onChangeValue(key, e.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-[0.2rem] select-none">
      <IdField
        value={values.id}
        isValid={fieldValidity.id}
        isRegExpValid={isRegexValidityMap.id}
        isDuplicateChecked={isDuplicateCheckedMap.id}
        feedback={feedbackMessages.id}
        onChange={handleFieldChange}
        onConfirm={onConfirmDuplicate}
        inputRef={inputRefs.id}
      />

      <NicknameField
        value={values.nickname}
        isValid={fieldValidity.nickname}
        isDuplicateChecked={isDuplicateCheckedMap.nickname}
        feedback={feedbackMessages.nickname}
        onChange={handleFieldChange}
        onConfirm={onConfirmDuplicate}
        inputRef={inputRefs.nickname}
      />

      <PasswordGroup
        values={values}
        validity={fieldValidity}
        feedback={feedbackMessages}
        onChange={handleFieldChange}
        inputRefs={inputRefs}
      />
    </div>
  );
}
