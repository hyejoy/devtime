'use client';

import RankingProfile from '@/app/components/ranking/RankingProfile';
import { rankingService } from '@/services/rankingService';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiResponse } from '@/types/api/helpers';
import clsx from 'clsx';

type RankingType = ApiResponse<'/api/rankings', 'get'>['data']['rankings'];

export default function Page() {
  const [rankings, setRankings] = useState<RankingType>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'total' | 'avg'>('total');

  const isFetching = useRef(false);
  const observerRef = useRef<HTMLDivElement>(null);

  /**  1. 데이터 호출 함수 최적화 */
  const fetchRankings = useCallback(
    async (pageNum: number) => {
      // 이미 로딩 중이거나 다음 페이지가 없으면 차단
      if (isFetching.current || !hasNextPage) return;
      isFetching.current = true;
      setIsLoading(true);
      console.log('fetchRankings 실행');

      try {
        const res = await rankingService.getRankings(sortBy, pageNum, 5);
        const newRankings = res.data.rankings;
        console.log('가져온 랭킹 데이터:', newRankings);
        setRankings((prev) => {
          // 중복 데이터 방지
          const existingIds = new Set(prev.map((r) => r.userId));
          const filteredNew = newRankings.filter((r) => !existingIds.has(r.userId));
          return [...prev, ...filteredNew];
        });

        setHasNextPage(res.data.pagination.hasNext);
      } catch (error) {
        console.error('랭킹 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    },
    [isLoading, hasNextPage, sortBy]
  ); // hasNextPage는 여기서 체크하지 않고 로직 내부에서 확인

  /** 1. 데이터 호출 전용 */
  useEffect(() => {
    fetchRankings(page);
  }, [page, sortBy]);

  /** 2. 정렬 기준 변경 시 초기화 */
  useEffect(() => {
    setRankings([]);
    setHasNextPage(true);

    // 만약 현재 page가 이미 1이라면 useEffect([page, sortBy])가 작동하지 않을 수 있으므로
    // page가 1일 때는 직접 호출, 아닐 때만 setPage(1)
    if (page === 1) {
      fetchRankings(1);
    } else {
      setPage(1);
    }
  }, [sortBy]);

  /**  3. Intersection Observer 최적화 */
  useEffect(() => {
    console.log('실행', { hasNextPage, isLoading });
    const observer = new IntersectionObserver(
      (entries) => {
        // 가시성 검사 + 중복 실행 방지 조건
        if (entries[0].isIntersecting && hasNextPage && !isFetching.current) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 } // 1.0은 너무 엄격해서 데이터가 적을 때 작동 안 할 수 있음
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isLoading, sortBy]);

  return (
    <main className="mt-10">
      <section>
        <div className="flex h-[54px] w-fit cursor-pointer items-center justify-start gap-1 rounded-lg bg-white">
          <div
            className={clsx(
              't ml-2 rounded-md p-2',
              sortBy === 'total' ? 'bg-primary-light' : 'bg-white'
            )}
            onClick={() => {
              setSortBy('total');
            }}
          >
            총 학습 시간
          </div>
          <div
            className={clsx(
              'mr-2 rounded-md p-2',
              sortBy === 'avg' ? 'bg-primary-light' : 'bg-white'
            )}
            onClick={() => {
              setSortBy('avg');
            }}
          >
            일 평균 학습 시간
          </div>
        </div>
      </section>
      <section>
        {rankings.map((ranking, index) => (
          // key값에 index를 추가하여 안전하게 렌더링
          <RankingProfile key={`${ranking.userId}-${index}`} {...ranking} />
        ))}
      </section>

      <div ref={observerRef} className="flex h-20 w-full items-center justify-center">
        {isLoading && <p className="text-gray-400">데이터를 불러오는 중입니다...</p>}
        {!hasNextPage && rankings.length > 0 && (
          <p className="text-gray-300">마지막 순위입니다. 🏆</p>
        )}
      </div>
    </main>
  );
}
