import styles from './TextLabel.module.css';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<'label'> {
  label: string;
  name: string;
}

export default function TextLabel({ label, name, ...props }: Props) {
  return (
    <label htmlFor={name} className={styles.label} {...props}>
      {label}
    </label>
  );
}
