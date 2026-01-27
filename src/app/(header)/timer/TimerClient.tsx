'use client';

import { ActiveTimerResponse, StartTimerResponse } from '@/types/api';
import { SplitTime, timerSummary } from '@/types/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './TimerClient.module.css';
import { useTimer } from './context/TimerContext';
import { API } from '@/constants/endpoints';

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
  const timer = useTimer();

  function createSplitTime(startTime: string): SplitTime {
    const start = new Date(startTime);
    const now = new Date();
    // 1. 밀리초 차이 계산
    const diffMs = now.getTime() - start.getTime();
    console.log('밀리초 차이 계산 (현재-param):', diffMs);
    console.log('밀리초 차이 계산 (현재-param)type:', typeof diffMs);

    // 2. 초 단위로 환산 (1000으로 나눔)
    // Math.max(0, ...)를 사용하여 음수가 나오지 않게 방어 로직 추가
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    // console.log('초단위로 환산 ::', diffSeconds);
    return {
      date: now.toISOString(),
      timeSpent: diffSeconds, // 초' 단위 값
    };
  }
  // 초(seconds)를 받아 { hours, minutes, seconds } 객체로 반환
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // 항상 두 자리 문자열로 변환 (예: 5 -> "05")
    return {
      hours: String(hrs).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    };
  };

  // 활성화된 타이머 가져오기
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API.TIMER.TIMERS}`, {
          credentials: 'include',
        });
        const data: ActiveTimerResponse = await res.json();
        console.log('활성화된 타이머 가져오기>', data);
        setInitTimer(data);
        if (!data.error) {
          console.log('활성화된 타이머가 있어요');

          // 1. 기존 splitTimes의 모든 timeSpent 합산 (초 단위)
          const accumulatedTime = data.splitTimes.reduce(
            (acc, split) => acc + split.timeSpent,
            0
          );

          // 2. 마지막 업데이트 이후 현재까지 흐른 시간 계산
          const currentDiff = createSplitTime(data.lastUpdateTime).timeSpent;

          // 3. 타이머 상태 설정 (기존 누적 + 현재 차이)
          timer.setTimerId(data.timerId);
          timer.setLastStartTimestamp(data.lastUpdateTime);
          timer.setTotalActiveMs(accumulatedTime + currentDiff); // 합침
          timer.setIsRunning(true);
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const { hours, minutes, seconds } = formatTime(timer.displayTime || 0);
  // ▶️ 활성화 타이머 하나도 없을때 새로운 타이머 시작
  const onStartTimer = async () => {
    if (!timer.lastStartTimestamp && timerSummary) {
      // summary의 content로 구성된 배열
      const taskList = Object.values(timerSummary.tasks).map(
        (task) => task.content
      );

      const res = await fetch(`${API.TIMER.TIMERS}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          todayGoal: dailyGoal,
          tasks: taskList,
        }),
      });
      if (!res.ok) {
        throw new Error('타이머 시작 실패');
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 서버가 body 없이 성공 응답 준 경우
        return;
      }
      const next: StartTimerResponse = await res.json();
      // console.log('활성화 타이머 하나도 없을때 새로운 타이머 시작>', next);
      const now = new Date().toISOString();
      timer.setTimerId(next.timerId);
      timer.setFirstStartTime(now);
      timer.setLastStartTimestamp(now);
      timer.setIsRunning(true);
      return next;
    }

    // 활성화 타이머 있을때 타이머 시작
    if (timer.timerId) {
      onReStartTimer();
    }
  };

  // ▶️ 일시정지 후 다시 재생
  const onReStartTimer = async () => {
    if (!timer) return;
    const now = new Date().toISOString();
    // console.log('일시 정지 후 다시 재생', timer);
    timer.setLastStartTimestamp(now); // 기준점을 지금으로 초기화
    timer.setIsRunning(true);
  };

  // ⏸️ 타이머 일시정지
  const onPauseTimer = async () => {
    if (!timer) return;
    const split = createSplitTime(timer.lastStartTimestamp!);
    const now = new Date().toISOString();

    // 1. 계산된 값을 변수에 먼저 담기
    const nextTotalTime = split.timeSpent + Number(timer.totalActiveMs);
    // console.log(' 이번 세션 재생 시간:', split.timeSpent);
    // console.log(' 최종 저장될 총 시간:', nextTotalTime);

    timer.setTotalActiveMs(nextTotalTime);
    timer.setLastPauseTimestamp(now);
    timer.setIsRunning(false);

    const splitTimes = [
      ...(initTimer?.splitTimes ?? []), // initTimer나 splitTimes가 없으면 빈배열
      {
        date: new Date().toISOString(),
        timeSpent: split.timeSpent,
      },
    ];

    // API 요청 (현재 세션의 split 정보 전송)
    const res = await fetch(`${API.TIMER.ITEM(timer.timerId)}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({
        splitTimes,
      }),
    });

    if (!res.ok) return;
    const data = await res.json(); // 서버에서 업데이트된 전체 타이머 객체 반환
    setInitTimer(data);
    console.log('⏸️ 서버에서 업데이트된 전체 타이머 객체 : ', data);
  };

  const onFinishTimer = async () => {
    if (timerSummary!.review.length < 15) {
      alert('회고를 15장 이상 작성해주세요!');
      return;
    }
    const lastSplit = createSplitTime(timer.lastStartTimestamp!);
    const test = [...(initTimer?.splitTimes ?? [])];

    const finalSplitTimes = [
      ...(initTimer?.splitTimes ?? []), // 기존 데이터 (없으면 빈 배열)
      {
        date: new Date().toISOString(),
        timeSpent: lastSplit.timeSpent,
      },
    ];

    console.log(finalSplitTimes);

    const res = await fetch(`${API.TIMER.STOP(timer.timerId)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        splitTimes: finalSplitTimes, //  undefined 대신 배열 전달
        review: timerSummary?.review, // 15자 이상 확인됨
        tasks: timerSummary?.tasks ?? [], // [{content, isCompleted}] 형태
      }),
    });

    // TO-BE (수정된 코드)
    const responseData = await res.json(); // 데이터를 먼저 완전히 받습니다.
    console.log('종료된 타이머 정보_RES : ', responseData); // 받은 데이터를 출력합니다.

    if (res.ok) {
      setLoading(true);
      reSetDatas();
    } else {
      // 여기서 백엔드가 보낸 진짜 에러 메시지 확인
      console.error('백엔드 에러 상세:', responseData);
    }
    if (!res.ok) return;
  };

  const reSetDatas = () => {
    // 1. 먼저 모든 상태를 하나씩 초기화
    setTimerSummary(undefined);
    setDailyGoal(undefined);
    setInitTimer(undefined);

    // 2. Context(Provider)의 상태를 안전하게 초기화
    timer.timerReset();

    // 3. 마지막으로 로딩 상태를 해제
    setLoading(false);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className={cx('page')}>
      <div className={cx('title')}>
        <div className={cx('test')}>오늘도 열심히 달려봐요!</div>
      </div>

      <div className={cx('timerContainer')}>
        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>{hours[0]}</div>
            <div className={cx('digit')}>{hours[1]}</div>
          </div>
          <div className={cx('unit')}>HOURS</div>
        </div>

        <div className={cx('dot')}>:</div>

        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>{minutes[0]}</div>
            <div className={cx('digit')}>{minutes[1]}</div>
          </div>
          <div className={cx('unit')}>MINUTES</div>
        </div>

        <div className={cx('dot')}>:</div>

        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>{seconds[0]}</div>
            <div className={cx('digit')}>{seconds[1]}</div>
          </div>
          <div className={cx('unit')}>SECONDS</div>
        </div>
      </div>

      <div className={cx('buttonContainer')}>
        <div className={cx('buttonWrap')}>
          <div className={cx('playButtonField')}>
            <Image
              onClick={onStartTimer}
              className={cx('iconField')}
              src={`/images/timer/icon-start-${timer.isRunning ? 'disabled' : 'active'}.png`}
              alt="재생"
              width={80}
              height={80}
            />
            <Image
              onClick={onPauseTimer}
              className={cx('iconField')}
              src={`/images/timer/icon-pause-${timer.isRunning ? 'active' : 'disabled'}.png`}
              alt="일시정지"
              width={80}
              height={80}
            />
            <Image
              onClick={onFinishTimer}
              className={cx('iconField')}
              src={`/images/timer/icon-finish-${timer.lastStartTimestamp ? 'active' : 'disabled'}.png`}
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
