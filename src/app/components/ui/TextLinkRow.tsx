import Link from 'next/link';
import styles from './TextLinkRow.module.css';

type RoutePath = `/${string}`;
type TextLink = {
  question?: string;
  label: string;
  href: RoutePath;
};

export default function TextLinkRow({ question, label, href }: TextLink) {
  return (
    <div className={styles.linkContainer}>
      <div>{question}</div>
      <Link className="link" href={href}>
        {label}
      </Link>
    </div>
  );
}
