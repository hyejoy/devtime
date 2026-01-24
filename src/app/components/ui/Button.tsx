import classNames from 'classnames/bind';
import { ComponentProps } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[styles.button, styles[`variant_${variant}`], className].join(
        ' '
      )}
      {...props}
    />
  );
}
