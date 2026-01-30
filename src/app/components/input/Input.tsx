'use client';

import React, {
  Children,
  ComponentProps,
  JSX,
  ReactNode,
  useState,
} from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.css';
import TextLabel from '../ui/TextLabel'; // 기존 공용 라벨 활용

const cx = classNames.bind(styles);

interface InputGroupComponent {
  ({ children }: { children: ReactNode }): JSX.Element;
  Label: typeof TextLabel;
  Input: typeof Input;
  List: typeof List; // 할 일 목록 영역을 위해 추가 제안
}

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  onAdd?: () => void;
  size?: 'normal' | 'large'; // 이제 문자열을 안전하게 사용 가능
  buttonLabel?: string;
  classNames?: string;
}
interface LabelProps extends ComponentProps<'label'> {
  name: string;
  className?: string;
  children?: ReactNode;
}

// 1. Root: 전체를 감싸는 컨테이너
const InputGroupField: InputGroupComponent = ({ children }) => {
  return <div className={cx('groupContainer')}>{children}</div>;
};

const Label = ({ name, ...props }: LabelProps) => {
  return <label htmlFor={name} className={cx('label')} {...props} />;
};
// 2. Input: 입력창 + 추가 버튼이 결합된 형태
const Input = ({
  onAdd,
  buttonLabel = '추가',
  size = 'normal',
  onChange, // 부모로부터 받은 onChange가 있다면 실행하기 위해 추출
  className,
  ...props
}: InputProps) => {
  const [inputValue, setInputValue] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e); // 외부에서 주입한 핸들러도 작동하게 함
  };

  const isTextExist = inputValue.trim().length > 0;

  return (
    <div className={cx('inputWrapper')}>
      <input
        className={cx('input', `${size}SizeInput`, className)}
        onChange={handleInputChange}
        {...props}
      />
      {onAdd && (
        <button
          type="button"
          // 글자가 있을 때만 'active' 클래스 추가
          className={cx('addButton', { buttonActive: isTextExist })}
          onClick={onAdd}
          disabled={!isTextExist} // 글자 없을 땐 버튼 비활성화 (선택 사항)
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

// 3. List: 아래에 나열될 아이템들을 담는 컨테이너
const List = ({ children }: { children: ReactNode }) => {
  return <div className={cx('listContainer')}>{children}</div>;
};

// 네임스페이스 매핑
InputGroupField.Label = Label;
InputGroupField.Input = Input;
InputGroupField.List = List;

export default InputGroupField;
