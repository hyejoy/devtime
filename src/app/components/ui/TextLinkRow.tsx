import Link from 'next/link';
import styles from './TextLinkRow.module.css';
import classNames from 'classnames/bind';
type RoutePath = `/${string}`;
type TextLink = {
  question?: string;
  label: string;
  href: RoutePath;
  isBold?: boolean;
};
const cx = classNames.bind(styles);

export default function TextLinkRow({
  question,
  label,
  href,
  isBold = false,
}: TextLink) {
  const bold = isBold ? 'bold' : 'notBold';
  return (
    <div className={cx('linkContainer')}>
      <div>{question}</div>
      <Link className={cx(bold)} href={href}>
        {label}
      </Link>
    </div>
  );
}
