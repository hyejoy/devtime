'use client';

import { ActiveTimerResponse, StartTimerResponse } from '@/types/api';
import { timerSummary } from '@/types/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './TimerClient.module.css';
import { API } from '@/constants/endpoints';
import {
  useDisplayTime,
  useIsRunning,
  useLastStartTimestamp,
  useTimerActions,
  useTimerId,
  useTotalSeconds,
} from '@/store/timer';

const cx = classNames.bind(styles);

export default function TimerClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState<string | undefined>(
    '10시간 채워봅시다!✌️'
  );
  const [timerSummary, setTimerSummary] = useState<timerSummary | undefined>({
    review:
      '오늘 10시간 채우기 목표 달성 완료! 정말 보람찬 하루였어요.🐤🐤🐤!!',
    tasks: [
      { content: 'Next.js 공부하기', isCompleted: true },
      { content: '리엑트 공부하기', isCompleted: true },
      { content: 'devTime 구현하기', isCompleted: false },
    ],
  });
  const [initTimer, setInitTimer] = useState<ActiveTimerResponse | undefined>(
    undefined
  );

  const timerId = useTimerId();
  const lastStartTimestamp = useLastStartTimestamp();
  const isRunning = useIsRunning();

  const {
    setTimerId,
    setIsRunning,
    setTotalActiveSeconds,
    setLastStartTimestamp,
    tick,
    timerReset,
    createSplitTime,
  } = useTimerActions();

  const { hours, mins, secs } = useDisplayTime();

  // --- 헬퍼 함수 및 공통 로직 ---

  // 시간을 갱신하고 서버에 동기화하는 핵심 함수
  const handleSyncWithServer = async () => {
    if (!timerId || !lastStartTimestamp) return null;

    const split = createSplitTime(lastStartTimestamp);
    const now = new Date().toISOString();

    const newSplitTimes = [
      ...(initTimer?.splitTimes ?? []),
      {
        date: now,
        timeSpent: split.timeSpent,
      },
    ];

    try {
      const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitTimes: newSplitTimes }),
      });

      if (!res.ok) throw new Error('동기화 실패');

      const data: ActiveTimerResponse = await res.json();
      setInitTimer(data);
      setLastStartTimestamp(now); // 기준점 갱신
      return data;
    } catch (err) {
      console.error('서버 동기화 중 오류:', err);
      return null;
    }
  };

  const reSetDatas = () => {
    setDailyGoal(undefined);
    setInitTimer(undefined);
    timerReset();
    setLoading(false);
  };

  // --- 핸들러 함수 ---

  const onStartTimer = async () => {
    // 1. 처음 생성하는 경우
    if (!lastStartTimestamp) {
      const taskList = timerSummary?.tasks.map((t) => t.content) ?? [];
      try {
        const res = await fetch(`${API.TIMER.TIMERS}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todayGoal: dailyGoal, tasks: taskList }),
        });
        if (!res.ok) throw new Error('타이머 시작 실패');

        const next: StartTimerResponse = await res.json();
        setTimerId(next.timerId);
        setLastStartTimestamp(new Date().toISOString());
        setIsRunning(true);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 2. 일시정지 후 다시 시작하는 경우
    if (timerId) {
      setLastStartTimestamp(new Date().toISOString());
      setIsRunning(true);
    }
  };

  const onPauseTimer = async () => {
    if (!timerId) return;
    setIsRunning(false);
    await handleSyncWithServer();
  };

  const onFinishTimer = async () => {
    if (!timerSummary || timerSummary.review.length < 15) {
      alert('회고를 15자 이상 작성해주세요!');
      return;
    }

    // 종료 전 마지막 세션 시간을 서버에 한 번 더 보내서 완벽하게 맞춤
    const updatedData = await handleSyncWithServer();
    const finalSplitTimes = updatedData?.splitTimes ?? initTimer?.splitTimes;

    try {
      const res = await fetch(`${API.TIMER.STOP(timerId!)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splitTimes: finalSplitTimes,
          review: timerSummary.review,
          tasks: timerSummary.tasks,
        }),
      });

      if (res.ok) {
        setLoading(true);
        reSetDatas();
      }
    } catch (err) {
      console.error('타이머 종료 중 오류:', err);
    }
  };

  // --- Effects ---

  // 초기 활성 타이머 로드
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API.TIMER.TIMERS}`, {
          credentials: 'include',
        });
        const data: ActiveTimerResponse = await res.json();

        if (res.ok && !data.error) {
          setInitTimer(data);
          const accumulatedTime = data.splitTimes.reduce(
            (acc, s) => acc + s.timeSpent,
            0
          );
          const currentDiff = createSplitTime(data.lastUpdateTime).timeSpent;

          setTimerId(data.timerId);
          setIsRunning(true);
          setLastStartTimestamp(data.lastUpdateTime);
          setTotalActiveSeconds(accumulatedTime + currentDiff);
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 10분마다 자동 저장 (Polling)
  useEffect(() => {
    if (!timerId || !isRunning) return;

    const intervalId = setInterval(async () => {
      console.log('10분 자동 저장 실행 ✅');
      await handleSyncWithServer();
    }, 600000);

    return () => clearInterval(intervalId);
    // lastStartTimestamp를 의존성에서 빼야 인터벌이 10분을 온전히 채우고 실행됩니다.
  }, [timerId, isRunning, initTimer]);

  // 1초마다 UI 갱신 (Tick)
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => tick(), 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className={cx('page')}>
      <div className={cx('title')}>
        <div className={cx('test')}>오늘도 열심히 달려봐요!</div>
      </div>

      <div className={cx('timerContainer')}>
        <TimeDisplay unit="HOURS" value={hours} />
        <div className={cx('dot')}>:</div>
        <TimeDisplay unit="MINUTES" value={mins} />
        <div className={cx('dot')}>:</div>
        <TimeDisplay unit="SECONDS" value={secs} />
      </div>

      <div className={cx('buttonContainer')}>
        {/* 1. 메인 컨트롤 버튼 영역 (재생, 일시정지, 종료) */}
        <div className={cx('buttonWrap')}>
          <div className={cx('playButtonField')}>
            <TimerButton
              type="start"
              active={!isRunning}
              onClick={onStartTimer}
            />
            <TimerButton
              type="pause"
              active={isRunning}
              onClick={onPauseTimer}
            />
            <TimerButton
              type="finish"
              active={!!lastStartTimestamp}
              onClick={onFinishTimer}
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
              onClick={() => window.location.reload()} // 새로고침 기능 추가
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 가독성을 위한 간단한 서브 컴포넌트들
function TimeDisplay({ unit, value }: { unit: string; value: string }) {
  return (
    <div className={cx('timeField')}>
      <div className={cx('digitField')}>
        <div className={cx('digit')}>{value[0]}</div>
        <div className={cx('digit')}>{value[1]}</div>
      </div>
      <div className={cx('unit')}>{unit}</div>
    </div>
  );
}

function TimerButton({
  type,
  active,
  onClick,
}: {
  type: string;
  active: boolean;
  onClick: () => void;
}) {
  const state = active ? 'active' : 'disabled';
  return (
    <Image
      onClick={active ? onClick : undefined}
      className={cx('iconField', { disabled: !active })}
      src={`/images/timer/icon-${type}-${state}.png`}
      alt={type}
      width={80}
      height={80}
    />
  );
}
