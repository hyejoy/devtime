'use client';

import { S3_BASE_URL } from '@/constants/urls';
import { useProfileStore } from '@/store/profileStore';
import { Divide, Pencil, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const { profile, email, nickname } = useProfileStore();
  const { career, purpose, techStacks, profileImage, goal } = profile;
  return (
    <div className="mt-10 flex w-full rounded-lg bg-white p-9">
      <section>
        {/* 프로필 이미지 */}
        {profileImage && (
          <Image
            src={`${S3_BASE_URL}/${profileImage}`}
            alt="profile Image"
            width={140}
            height={140}
          />
        )}

        {!profileImage && (
          <div className="flex h-44 w-44 items-center justify-center bg-gray-100 p-10 text-gray-400">
            <UserIcon className="h-10 w-10" />
          </div>
        )}
      </section>
      <section className="ml-14 flex flex-1 flex-col">
        {/* 프로필 내용 */}
        <div className="mb-12 flex flex-col">
          <div className="text-primary-900 text-lg font-medium">{nickname}</div>
          {!purpose && (
            <div className="text-2xl font-bold text-gray-300">아직 설정된 목표가 없습니다.</div>
          )}
          {purpose && (
            <div className="text-primary-900 text-2xl font-bold">
              {typeof purpose === 'object' ? purpose.detail : purpose}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <div className="text-[14px] font-semibold text-gray-400">이메일 주소</div>
            {email && <div className="text-lg font-semibold text-gray-600">{email}</div>}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-400">개발 경력</div>
            {career && <div className="text-lg font-semibold text-gray-600">{career}</div>}
            {!career && (
              <div className="text-lg font-semibold text-gray-300">
                개발 경력을 업데이트 해주세요.
              </div>
            )}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-400">공부 목적</div>
            {goal && <div className="text-lg font-semibold text-gray-600">{goal}</div>}
            {!goal && (
              <div className="text-lg font-semibold text-gray-300">
                개발 경력을 업데이트 해주세요.
              </div>
            )}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-400"> 개발 스택</div>
            {techStacks.length > 0 && (
              <div className="flex gap-2">
                {techStacks.map(
                  (tech, index) =>
                    index < 6 && (
                      <span className="h-7 rounded-sm bg-gray-100 px-2 py-1">{tech}</span>
                    )
                )}
              </div>
            )}
            {techStacks.length === 0 && (
              <div className="text-lg font-semibold text-gray-300">
                현재 공부 중인 또는 가지고 있는 개발 스택을 업데이트 해주세요.
              </div>
            )}
          </div>
        </div>
      </section>
      <section>
        {/* 프로필 수정 아이콘 */}
        <Link href={'/profile/edit'}>
          <button className="flex cursor-pointer gap-2 text-gray-500">
            <Pencil className="y-6 h-6" />
            <span className="text-[14px] font-medium">회원정보 수정</span>
          </button>
        </Link>
      </section>
    </div>
  );
}
