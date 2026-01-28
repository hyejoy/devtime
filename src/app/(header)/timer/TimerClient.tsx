'use client';

import { ActiveTimerResponse, StartTimerResponse } from '@/types/api';
import { SplitTime, timerSummary } from '@/types/timer';
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
  const totalActiveSeconds = useTotalSeconds();
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      //  1초마다 스토어의 tick 함수를 실행
      intervalId = setInterval(() => {
        tick();
      }, 1000);
    }

    // 클린업 함수: 컴포넌트가 사라지거나(Unmount), isRunning이 바뀌면 인터벌 제거
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, tick]); // isRunning이 바뀔 때마다 실행 여부 결정

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

          console.log(
            '기존 splitTimes의 모든 timeSpent 합산 (초 단위) : ',
            accumulatedTime
          );

          // 2. 마지막 업데이트 이후 현재까지 흐른 시간 계산
          const currentDiff = createSplitTime(data.lastUpdateTime).timeSpent;

          console.log(
            '마지막 업데이트 이후 현재까지 흐른 시간 계산 (초):',
            currentDiff % 60
          );
          console.log('📝총 공부 시간 : ', accumulatedTime + currentDiff);

          // 3. 타이머 상태 설정 (기존 누적 + 현재 차이)
          setTimerId(data.timerId);
          setIsRunning(true);
          setLastStartTimestamp(data.lastUpdateTime);
          setTotalActiveSeconds(accumulatedTime + currentDiff); // 합침
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ▶️ 111 활성화 타이머 하나도 없을때 새로운 타이머 시작
  const onStartTimer = async () => {
    console.log('재생 버튼 클릭!');

    if (!lastStartTimestamp) {
      // summary의 content로 구성된 배열
      const taskList = Object.values(timerSummary!.tasks).map(
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
        console.log('서버가 body없이 성공 응답 줌');

        return;
      }
      const next: StartTimerResponse = await res.json();
      console.log('활성화 타이머 하나도 없을때 새로운 타이머 시작>', next);
      const now = new Date().toISOString();
      setTimerId(next.timerId);
      setLastStartTimestamp(now);
      setIsRunning(true);
      return next;
    }

    // 활성화 타이머 있을때 타이머 시작
    if (timerId) {
      onReStartTimer();
    }
  };

  // ▶️ 일시정지 후 다시 재생
  const onReStartTimer = async () => {
    console.log('일시 정지 후 다시 재생');

    if (!timerId) return;
    const now = new Date().toISOString();
    setLastStartTimestamp(now); // 기준점을 지금으로 초기화
    setIsRunning(true);
  };

  // ⏸️ 타이머 일시정지
  const onPauseTimer = async () => {
    if (!timerId) return;
    const split = createSplitTime(lastStartTimestamp!);
    const now = new Date().toISOString();

    const totalSeconds = split.timeSpent; // 예: 125초
    const mins = Math.floor(totalSeconds / 60); // 2분
    const secs = totalSeconds % 60;
    console.log(' 이번 세션 재생 시간:', `${mins}분${secs}초`);

    const totalSeconds3 = totalActiveSeconds; // 예: 125초
    const mins3 = Math.floor(totalSeconds3 / 60); // 2분
    const secs3 = totalSeconds3 % 60;
    console.log('TIMER STORE에 저장된 총 재생 시간', `${mins3}분${secs3}초`);

    //test
    setLastStartTimestamp(now);
    setIsRunning(false);

    const splitTimes = [
      ...(initTimer?.splitTimes ?? []), // initTimer나 splitTimes가 없으면 빈배열
      {
        date: new Date().toISOString(),
        timeSpent: split.timeSpent,
      },
    ];

    // API 요청 (현재 세션의 split 정보 전송)
    const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
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

  // 타이머 종료
  const onFinishTimer = async () => {
    if (timerSummary!.review.length < 15) {
      alert('회고를 15장 이상 작성해주세요!');
      return;
    }

    console.log('서버로 보낼 총 splitTimes :: ', initTimer?.splitTimes);

    const res = await fetch(`${API.TIMER.STOP(timerId)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        splitTimes: initTimer?.splitTimes, //  undefined 대신 배열 전달
        review: timerSummary?.review, // 15자 이상 확인됨
        tasks: timerSummary?.tasks ?? [], // [{content, isCompleted}] 형태
      }),
    });

    const responseData = await res.json();
    console.log('종료된 타이머 정보_RES : ', responseData);

    if (res.ok) {
      setLoading(true);
      reSetDatas();
    } else {
      // 여기서 백엔드가 보낸 진짜 에러 메시지 확인
      console.error('백엔드 에러 상세:', responseData);
    }
    if (!res.ok) return;
  };

  // TODO 주석 풀기
  const reSetDatas = () => {
    // setTimerSummary(undefined);
    setDailyGoal(undefined);
    setInitTimer(undefined);

    timerReset(); // timer store 값 초기화

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
            <div className={cx('digit')}>{mins[0]}</div>
            <div className={cx('digit')}>{mins[1]}</div>
          </div>
          <div className={cx('unit')}>MINUTES</div>
        </div>

        <div className={cx('dot')}>:</div>

        <div className={cx('timeField')}>
          <div className={cx('digitField')}>
            <div className={cx('digit')}>{secs[0]}</div>
            <div className={cx('digit')}>{secs[1]}</div>
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
              src={`/images/timer/icon-start-${isRunning ? 'disabled' : 'active'}.png`}
              alt="재생"
              width={80}
              height={80}
            />
            <Image
              onClick={onPauseTimer}
              className={cx('iconField')}
              src={`/images/timer/icon-pause-${isRunning ? 'active' : 'disabled'}.png`}
              alt="일시정지"
              width={80}
              height={80}
            />
            <Image
              onClick={onFinishTimer}
              className={cx('iconField')}
              src={`/images/timer/icon-finish-${lastStartTimestamp ? 'active' : 'disabled'}.png`}
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
