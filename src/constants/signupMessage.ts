export const MESSAGE = {
  /* 기본 입력 안내 */
  REQUIRED: {
    id: '이메일 주소 형식으로 입력해 주세요.',
    nickname: '닉네임을 입력해 주세요.',
    password: '비밀번호를 입력해 주세요.',
    checkPassword: '비밀번호를 다시 입력해 주세요.',
  },

  LOGIN: {
    email: '이메일 주소를 입력해 주세요.',
    password: '비밀번호를 입력해 주세요.',
  },
  /* 이메일 */
  EMAIL_INVALID: '이메일 형식으로 작성해 주세요.',
  EMAIL_DUPLICATE_REQUIRED: '중복을 확인해 주세요.',
  EMAIL_AVAILABLE: '사용 가능한 이메일입니다.',
  EMAIL_DUPLICATED: '이미 사용 중인 이메일입니다.',

  /* 닉네임 */
  NICKNAME_AVAILABLE: '사용 가능한 닉네임입니다.',
  NICKNAME_DUPLICATED: '이미 사용 중인 닉네임입니다.',

  /* 비밀번호 */
  PASSWORD_INVALID: '비밀번호는 8자 이상, 영문과 숫자 조합이어야 합니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
} as const;
