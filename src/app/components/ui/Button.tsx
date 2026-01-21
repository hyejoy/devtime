import styles from './Button.module.css';
import classNames from 'classnames/bind';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary';
};

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const cx = classNames.bind(styles);
  return (
    <button
      className={cx('button', `variant_${variant}`, className)}
      {...props}
    />
  );
}
