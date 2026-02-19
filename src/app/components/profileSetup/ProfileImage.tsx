'use client';

import TextLabel from '@/app/components/ui/TextLabel';
import { ChangeEvent, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { PlusIcon } from 'lucide-react';
import { API } from '@/constants/endpoints';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';
import { useProfileActions } from '@/store/profileStore';
import { profileService } from '@/services/profileService';

export default function ProfileImage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setProfile } = useProfileActions();
  /** state */

  type Image = {
    file: File;
    previewUrl: string;
  };

  const [image, setImages] = useState<Image>();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 용량 및 형식 제한 검사
    const MAX_SIZE = 5 * 1024 * 1024; //5MB
    if (file.size > MAX_SIZE) return alert('5MB 이하의 파일만 업로드 가능합니다.');
    if (!['image/jpg', ' image/jpeg', 'image/png'].includes(file.type)) {
      return alert('jpg, png 형식만 업로드 가능합니다');
    }

    try {
      const res = await profileService.imageUpload(file);
      if (res.ok) {
        setProfile('profileImage', res);
      }
    } catch (err) {
      console.error('이미지 업로드 실패 : ', err);
    }
  };

  const handleSelectImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 한 개만 선택한다고 가정
    if (!file) return;

    // 브라우저 미리 보기
    setImages({ file, previewUrl: URL.createObjectURL(file) });

    // 2. API 요청 데이터 준비
    const requestBody: ApiRequest<'/api/file/presigned-url', 'post'> = {
      fileName: file.name,
      contentType: file.type,
    };
    try {
      // Presigne URL 발급 요청
      const res = await fetch(`${API.FILE.UPLOAD}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, // Header 추가
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error('이미지 업로드 실패');
      const { presignedUrl, key }: ApiResponse<'/api/file/presigned-url', 'post'> =
        await res.json();

      // 스토리지(S3) 실제 업로드
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
      });

      if (!uploadRes.ok) throw new Error('스토리지 업로드 실패');
      setProfile('profileImage', key);
      return key;
    } catch (error) {
      console.error('이미지 업로드 에러', error);
    } finally {
      e.target.value = ''; // 같은 파일 재선택 가능하도록 초기화
    }
  };
  return (
    <div className="flex flex-col">
      <div className="mb-9">
        <TextLabel label="프로필 이미지" name="ProfileImage" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleSelectImage}
        />
        <div className="flex gap-[12px]">
          <div
            className={clsx(
              'border-brand-primary h-[120px] w-[120px] rounded-md border bg-white text-2xl',
              'mt-[8px] flex cursor-pointer items-center justify-center',
              image ? 'border-none' : 'border-dashed'
            )}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            {image ? (
              <div className="relative h-[120px] w-[120px] overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={image.previewUrl}
                  alt="profile Image"
                  fill
                  sizes="120px"
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <PlusIcon className="text-brand-primary h-[23.85px] w-[23.85px]" />
            )}
          </div>
          <div className="flex flex-col justify-end text-[14px] font-medium text-gray-600">
            5MB 미만의 .png .jpg 파일
          </div>
        </div>
      </div>
    </div>
  );
}
