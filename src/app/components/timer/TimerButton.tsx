'use client';

import Image, { ImageProps } from 'next/image'; // Next.js 전용 타입 사용
import styles from './TimeButton.module.css';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// ImageProps를 상속받고, 필요한 커스텀 속성 추가
interface TimerButtonProps extends Omit<ImageProps, 'src' | 'alt'> {
  timerType: 'start' | 'pause' | 'finish';
  active: boolean;
  onClick?: () => void;
}

const TimerButton = ({
  timerType,
  active,
  onClick,
  ...props
}: TimerButtonProps) => {
  // active 여부에 따라 파일명 결정
  const state = active ? 'active' : 'disabled';
  const src = `/images/timer/icon-${timerType}-${state}.png`;

  return (
    <Image
      {...props}
      src={src}
      alt={`${timerType} ${state}`}
      width={props.width || 80}
      height={props.height || 80}
      onClick={active ? onClick : undefined}
      /* active가 아닐 때 시각적 피드백을 위해 클래스 바인딩 */
      className={cx('iconButton', { disabled: !active }, props.className)}
      style={{
        cursor: active ? 'pointer' : 'not-allowed',
        ...props.style,
      }}
    />
  );
};

export default TimerButton;
