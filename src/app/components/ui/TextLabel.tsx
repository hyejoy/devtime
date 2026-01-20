import styles from './TextLabel.module.css';

export default function TextLabel({
  name,
  label,
}: {
  label: string;
  name: string;
}) {
  return (
    <label htmlFor={name} className={styles.label}>
      {label}
    </label>
  );
}
