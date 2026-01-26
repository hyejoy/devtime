'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TimerClient.module.css';
import classNames from 'classnames/bind';
import { fetchActiveTimer } from '@/services/timer';
import Image from 'next/image';

const cx = classNames.bind(styles);

export default function TimerClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ 세션 확인 (refresh 포함)
        const sessionRes = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        console.log('sessionRes......', sessionRes);

        if (!sessionRes.ok) {
          router.replace('/login');
          return;
        }

        // 2️⃣ 타이머 데이터 요청
        const timerData = await fetch('/api/timers', {
          credentials: 'include',
        });
        console.log('>>>>>>>>>>>>', timerData);

        setData(timerData);
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className={cx('page')}>
      <div className={cx('title')}>
        <div className={cx('test')}>오늘도 열심히 달려봐요!</div>
      </div>

      <div className={cx('timerContainer')}>
        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>1</div>
            <div className={cx('digit')}>2</div>
          </div>
          <div className={cx('unit')}>HOURS</div>
        </div>

        <div className={cx('dot')}>:</div>

        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>0</div>
            <div className={cx('digit')}>1</div>
          </div>
          <div className={cx('unit')}>MINUTES</div>
        </div>

        <div className={cx('dot')}>:</div>

        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>1</div>
            <div className={cx('digit')}>5</div>
          </div>
          <div className={cx('unit')}>SECONDS</div>
        </div>
      </div>

      <div className={cx('buttonContainer')}>
        <div className={cx('buttonWrap')}>
          <div className={cx('playButtonField')}>
            <Image
              className={cx('iconField')}
              src="/images/timer/icon-start-active.png"
              alt="재생"
              width={80}
              height={80}
            />
            <Image
              className={cx('iconField')}
              src="/images/timer/icon-pause-disabled.png"
              alt="일시정지"
              width={80}
              height={80}
            />
            <Image
              className={cx('iconField')}
              src="/images/timer/icon-finish-disabled.png"
              alt="정지"
              width={80}
              height={80}
            />
          </div>
        </div>

        <div className={cx('iconContainer')}>
          <div className={cx('iconWrap')}>
            <Image
              className={cx('iconField')}
              src="/images/timer/see-todo-active.png"
              alt="할 일 목록"
              width={55}
              height={55}
            />
            <Image
              className={cx('iconField')}
              src="/images/timer/reset-active.png"
              alt="새로고침"
              width={55}
              height={55}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
