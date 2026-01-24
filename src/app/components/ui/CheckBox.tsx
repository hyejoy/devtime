'use client';

import classNames from 'classnames/bind';
import { ChangeEvent, ComponentProps, forwardRef } from 'react';
import styles from './CheckBox.module.css';

interface Props extends ComponentProps<'input'> {
  label?: string;
  id: string;
  isChecked: boolean;
  isSubmitted: boolean;
  onToggleCheck: (e: ChangeEvent<HTMLInputElement>) => void;
}
const cx = classNames.bind(styles);

const CheckBox = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      id,
      isChecked = false,
      isSubmitted = false,
      onToggleCheck,
      ...rest
    },
    ref
  ) => {
    const showErrorBorder = !isChecked && isSubmitted;

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
          className={cx('checkbox', { errorBorder: showErrorBorder })}
          {...rest}
        />
      </div>
    );
  }
);

CheckBox.displayName = 'CheckBox';
export default CheckBox;
