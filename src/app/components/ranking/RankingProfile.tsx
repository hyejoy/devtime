import { ApiResponse } from '@/types/api/helpers';
import Image from 'next/image';
import clsx from 'clsx';
import { formattedTime } from '@/utils/formatTime';
type RankingProfileProps = ApiResponse<'/api/rankings', 'get'>['data']['rankings'][0];

const RankingProfile = (props: RankingProfileProps) => {
  const { averageStudyTime, nickname, profile, rank, totalStudyTime, userId } = props;
  const { career, profileImage, purpose, techStacks } = profile;
  return (
    <>
      <div className="mt-3 flex h-auto gap-9 rounded-lg bg-white px-6 py-3">
        <div className="flex w-fit flex-col">
          <div
            className={clsx(
              'flex w-fit items-center justify-center rounded-md px-2 py-[3px] font-bold',
              {
                'bg-brand-primary text-white': rank === 1 || rank === 2 || rank === 3,
                'bg-brand-primary-10 text-brand-primary': rank > 3,
              }
            )}
          >
            {rank}위
          </div>
          <div className="relative mt-4 h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={profileImage ?? '/images/profile/profile.png'}
              alt="profile"
              fill // 부모 크기에 맞춤
              sizes="80px"
              className="object-cover" // 비율 유지하며 꽉 채움
            />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="mb-4">
            <div className="text-brand-primary text-[20px] font-bold">{nickname}</div>
            <div className="text-brand-primary text-[16px] font-medium">
              {typeof purpose === 'string' ? purpose : '목적 없음'}
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex gap-2">
              <span className="text-[16px] font-normal text-gray-500">누적</span>{' '}
              <span className="text-[16px] font-semibold">{formattedTime(totalStudyTime)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[16px] font-normal text-gray-500">일 평균</span>{' '}
              <span className="text-[16px] font-semibold">{formattedTime(averageStudyTime)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[16px] font-normal text-gray-500">경력</span>{' '}
              <span className="text-[16px] font-semibold">{career}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {techStacks.map((tech) => (
              <span
                key={`tech-${tech.id}-${userId}`}
                className="rounded-sm bg-gray-100 px-2 py-1 text-gray-500"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RankingProfile;
