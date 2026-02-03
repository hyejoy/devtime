'use client';

import React, { ComponentProps, JSX, ReactNode, useState } from 'react';
import clsx from 'clsx';
import TextLabel from '../ui/TextLabel';

/** --- Interfaces --- */
interface InputGroupComponent {
  ({ children }: { children: ReactNode }): JSX.Element;
  Label: typeof Label;
  Input: typeof Input;
  List: typeof List;
}

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  onAdd?: () => void;
  size?: 'normal' | 'large';
  buttonLabel?: string;
}

interface LabelProps extends ComponentProps<'label'> {
  name: string;
  className?: string;
  children?: ReactNode;
}

/** --- Components --- */

// 1. Root: 전체 컨테이너
const InputGroupField: InputGroupComponent = ({ children }) => {
  return <div className="flex flex-col">{children}</div>;
};

// 2. Label: 폰트 및 간격 적용
const Label = ({ name, className, ...props }: LabelProps) => {
  return (
    <label
      htmlFor={name}
      className={clsx(
        'mb-2 text-[14px] leading-[18px] font-medium text-gray-600',
        className
      )}
      {...props}
    />
  );
};

// 3. Input: 입력창 + 버튼 (기존 .inputWrapper와 통합)
const Input = ({
  onAdd,
  buttonLabel = '추가',
  size = 'normal',
  onChange,
  className,
  ...props
}: InputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e);
  };

  const isTextExist = inputValue.trim().length > 0;

  return (
    <div className="flex min-w-[568px]">
      <input
        className={clsx(
          'flex-1 transition-all duration-200 outline-none',
          size === 'large'
            ? 'mb-8 w-full border-none bg-transparent text-[36px] leading-[46px] font-bold placeholder:text-gray-300 focus:text-gray-600'
            : 'rounded-l-lg border-none bg-gray-100 px-6 py-[18px] text-[16px] text-gray-600',
          className
        )}
        onChange={handleInputChange}
        {...props}
      />
      {onAdd && (
        <button
          type="button"
          className={clsx(
            'cursor-pointer rounded-r-lg p-[18px] text-[16px] font-bold transition-colors duration-200',
            isTextExist
              ? 'text-brand-primary bg-gray-100'
              : 'bg-gray-100 text-gray-400'
          )}
          onClick={onAdd}
          disabled={!isTextExist}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

// 4. List: 아이템 목록 컨테이너
const List = ({ children }: { children: ReactNode }) => {
  return <div className="mt-4">{children}</div>;
};

// 네임스페이스 매핑
InputGroupField.Label = Label;
InputGroupField.Input = Input;
InputGroupField.List = List;

export default InputGroupField;
