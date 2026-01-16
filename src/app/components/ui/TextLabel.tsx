import styles from './TextLabel.module.css';

export default function TextLabel({
  label,
  name,
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
