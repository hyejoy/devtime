import styles from './Button.module.css';

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
      className={[styles.button, styles[`variant_${variant}`], className].join(
        ' '
      )}
      {...props}
    />
  );
}
