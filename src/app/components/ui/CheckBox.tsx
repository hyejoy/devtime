'use client';

import classNames from 'classnames/bind';
import { ChangeEvent, forwardRef, InputHTMLAttributes } from 'react';
import styles from './CheckBox.module.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  isChecked: boolean;
  onToggleCheck: (e: ChangeEvent<HTMLInputElement>) => void;
}

const cx = classNames.bind(styles);

const CheckBox = forwardRef<HTMLInputElement, Props>(
  ({ label, id, isChecked = false, onToggleCheck, ...rest }, ref) => {
    return (
      <div className={styles.container}>
        {label && (
          <label
            htmlFor={id}
            className={cx({
              checked: isChecked,
              unchecked: !isChecked,
            })}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onToggleCheck(e)}
          className={styles.checkbox}
          {...rest}
        />
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';
export default CheckBox;
