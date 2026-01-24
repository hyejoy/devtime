import styles from './TextFieldButton.module.css';

type TextFieldButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function TextFieldButton({
  children,
  ...props
}: TextFieldButtonProps) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}
