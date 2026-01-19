'use client';

import { useRef, useState, ChangeEvent } from 'react';
import TextField from './../ui/TextField';
import TextFieldInput from '../ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export default function SignupFields() {
  /* refs */
  const idRef = useRef<HTMLInputElement>(null);
  const nickNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const checkPasswordRef = useRef<HTMLInputElement>(null);

  /* state */
  const [id, setId] = useState('');
  const [nickName, setNickName] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  /* feedback Message */
  const [idFeedback, setIdFeedback] = useState('');
  const [nickNameFeedback, setNickNameFeedback] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [checkPasswordFeedback, setCheckPasswordFeedback] = useState('');

  /* validCheck */
  const [duplicateId, setDuplicateId] = useState(false);
  const [duplicateNickName, setDuplicateNickName] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [validCheckPassword, setValidCheckPassword] = useState(false);
  const [termCheck, setTermCheck] = useState(false);

  const DUPLICATE_CHECK_REQUIRED_MESSAGE = '중복을 확인해 주세요.';
  const PASSWORD_MISMATCH_MESSAGE = '비밀번호가 일치하지 않습니다.';
  /* handlers */
  const handleId = (e: ChangeEvent<HTMLInputElement>) => {
    const id = e.target.value;
    const feedback = '이메일 형식으로 작성해 주세요.';
    setId(e.target.value);
    if (!id) {
      setIdFeedback(feedback);
    } else {
      const isValid = emailRegex.test(id);
      if (isValid) {
        if (!duplicateId) {
          setIdFeedback(DUPLICATE_CHECK_REQUIRED_MESSAGE);
        } else {
          setIdFeedback('');
        }
      } else {
        setIdFeedback(feedback);
      }
    }
  };

  const handleNickName = (e: ChangeEvent<HTMLInputElement>) => {
    const nickName = e.target.value;
    setNickName(e.target.value);
    if (!nickName) {
      setNickNameFeedback('닉네임을 입력해 주세요.');
    } else {
      if (!duplicateNickName) {
        setNickNameFeedback(DUPLICATE_CHECK_REQUIRED_MESSAGE);
      } else {
        setNickNameFeedback('');
      }
    }
  };

  const handlePassword = (e: ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const feedback = '비밀번호는 8자 이상, 영문과 숫자 조합이어야 합니다.';
    setPassword(e.target.value);

    if (checkPassword.trim() !== '') {
      if (password !== checkPassword) {
        setCheckPasswordFeedback(PASSWORD_MISMATCH_MESSAGE);
      } else {
        setCheckPasswordFeedback('');
      }
    }
    if (!password) {
      setPasswordFeedback(feedback);
    } else {
      const isValid = passwordRegex.test(password);
      setPasswordFeedback(isValid ? '' : feedback);
      if (isValid) {
        setPasswordFeedback('');
      } else {
        setPasswordFeedback(feedback);
      }
    }
  };

  const handleCheckPassword = (e: ChangeEvent<HTMLInputElement>) => {
    const checkPassword = e.target.value;
    setCheckPassword(e.target.value);
    if (checkPassword !== password) {
      setCheckPasswordFeedback(PASSWORD_MISMATCH_MESSAGE);
    } else {
      setCheckPasswordFeedback('');
    }
  };

  const onToggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const isCheck = e.currentTarget.checked;
    setTermCheck(isCheck);
  };
  return (
    <>
      <TextField
        ref={idRef}
        name="id"
        label="아이디"
        type="email"
        value={id}
        onChangeValue={handleId}
        placeholder="이메일 주소 형식으로 입력해 주세요."
        buttonName="중복 확인"
        feedbackMessage={idFeedback}
        valiConfirm={duplicateId}
      />

      <TextField
        ref={nickNameRef}
        name="nickName"
        label="닉네임"
        value={nickName}
        onChangeValue={handleNickName}
        placeholder="닉네임을 입력해 주세요."
        buttonName="중복 확인"
        feedbackMessage={nickNameFeedback}
        valiConfirm={duplicateNickName}
      />

      <TextLabel label="비밀번호" name="password" />
      <TextFieldInput
        name="password"
        value={password}
        onChangeValue={handlePassword}
        placeholder="비밀번호를 입력해주세요."
        type="password"
        feedbackMessage={passwordFeedback}
        valiConfirm={validPassword}
        ref={passwordRef}
      />
      <TextLabel label="비밀번호 확인" name="checkPassword" />
      <TextFieldInput
        name="checkPassword"
        value={checkPassword}
        onChangeValue={handleCheckPassword}
        placeholder="비밀번호를 다시 입력해 주세요."
        type="password"
        feedbackMessage={checkPasswordFeedback}
        valiConfirm={validCheckPassword}
        ref={checkPasswordRef}
      />
    </>
  );
}
