import Link from 'next/link';
import styles from './TextLinkRow.module.css';
import classNames from 'classnames/bind';

type RoutePath = `/${string}`;

interface Props {
  question?: string;
  label: string;
  href: RoutePath;
  isBold?: boolean;
}

const cx = classNames.bind(styles);

export default function TextLinkRow({
  question,
  label,
  href,
  isBold = false,
}: Props) {
  return (
    <div className={cx('linkContainer')}>
      {question && <div>{question}</div>}
      <Link href={href} className={cx({ bold: isBold, notBold: !isBold })}>
        {label}
      </Link>
    </div>
  );
}
