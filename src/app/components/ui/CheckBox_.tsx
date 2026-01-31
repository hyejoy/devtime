'use client';
import { ComponentProps, useState } from 'react';
import styles from './CheckBox_.module.css';
import classNames from 'classnames/bind';

interface CheckboxProps extends ComponentProps<'input'> {
  id: string;
  width: number;
  height: number;
  isChecked: boolean;
  className?: 'whiteCheckbox' | 'negativeCheckbox' | 'checkbox';
  onChange: () => void; // ✅ prop 정의
}
const cx = classNames.bind(styles);

export default function CheckBox_({
  id,
  onChange,
  isChecked,
  className = 'checkbox',
  ...props
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cx('checkbox', className)}
      id={id}
      onChange={onChange}
      checked={isChecked}
      {...props}
    />
  );
}
