import Link from 'next/link';
import styles from './TextLinkRow.module.css';

type RoutePath = `/${string}`;
type TextLink = {
  message: string;
  href: RoutePath;
};

export default function TextLinkRow({ message, href }: TextLink) {
  return (
    <div className={styles.linkContainer}>
      <div>회원이신가요?</div>
      <Link className="link" href={href}>
        {message}
      </Link>
    </div>
  );
}
