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
  onClick: React.MouseEventHandler<HTMLInputElement>;
}
const cx = classNames.bind(styles);

export default function CheckBox_({
  id,
  isChecked,
  className = 'checkbox',
  ...props
}: CheckboxProps) {
  return (
    <input
      className={cx('checkbox', className)}
      id={id}
      type="checkbox"
      checked={isChecked}
      {...props}
    />
  );
}
