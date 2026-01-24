'use client';

import classNames from 'classnames/bind';
import { ChangeEvent, ComponentProps, forwardRef } from 'react';
import styles from './CheckBox.module.css';

interface Props extends ComponentProps<'input'> {
  label?: string;
  id: string;
  checked: boolean;
  onToggleCheck: (e: ChangeEvent<HTMLInputElement>) => void;
}
const cx = classNames.bind(styles);

const CheckBox = forwardRef<HTMLInputElement, Props>(
  ({ label, id, checked = false, onToggleCheck }, ref) => {
    return (
      <div className={styles.container}>
        {label && (
          <label
            htmlFor={id}
            className={checked ? styles.checked : styles.unchecked}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleCheck(e)}
          className={styles.checkbox}
        />
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';
export default CheckBox;
