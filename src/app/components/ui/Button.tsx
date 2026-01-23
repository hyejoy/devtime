import styles from './Button.module.css';
import classNames from 'classnames/bind';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary';
};

const cx = classNames.bind(styles);
export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx('button', `variant_${variant}`, className)}
      {...props}
    />
  );
}
