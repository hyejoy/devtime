'use-client';

import Button from '@/app/components/ui/Button';
import { SelectBox } from '@/app/components/ui/SelectBox';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import TextLinkRow from '@/app/components/ui/TextLinkRow';
import { techService } from '@/services/techService';
import { ProfileUpdatePayload, useProfileStore } from '@/store/profileStore';
import { ProfilePostRequest, TechStackGetResponse } from '@/types/api';
import { TechStackItem } from '@/types/profile';
import clsx from 'clsx';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

const CAREER_OPTIONS = [
  { value: '경력 없음', label: '경력 없음' },
  { value: '0 - 3년', label: '0 - 3년' },
  { value: '4 - 7년', label: '4 - 7년' },
  { value: '8 - 10년', label: '8 - 10년' },
  { value: '11년 이상', label: '11년 이상' },
];

const PURPOSE_OPTIONS = [
  { label: '취업 준비', value: '취업 준비' },
  { label: '이직 준비', value: '이직 준비' },
  { label: '단순 개발 역량 향상', value: '단순 개발 역량 향상' },
  { label: '회사 내 프로젝트 원활하게 수행', value: '회사 내 프로젝트 원활하게 수행' },
  { label: '기타(직접 입력)', value: '기타' },
];

export default function ProfileSetupField() {
  /** zustand */
  const { profile } = useProfileStore();
  const { setProfile } = useProfileStore((state) => state.actions);

  /** state */
  const [searchKeyword, setSearchKeword] = useState('');
  const [searchResult, setSearchResult] = useState<TechStackGetResponse>([]);
  const [isCreating, setIsCreating] = useState(false);

  /** 기술 스택 검색 API 호출 */
  const fetchSearchKeyword = useCallback(async () => {
    try {
      if (searchKeyword.trim() === '') {
        setSearchResult([]);
        return;
      }
      const res = await techService.get(searchKeyword);
      setSearchResult(res.results);
    } catch (error) {
      console.error('기술 스택 검색 실패:', error);
    }
  }, [searchKeyword]);

  /** 검색어 입력 디바운싱 */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchKeyword();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSearchKeyword]);

  /** 공통 필드 변경 핸들러 */
  const handleFieldChange = <K extends keyof ProfileUpdatePayload>(
    key: K,
    value: ProfileUpdatePayload[K]
  ) => {
    setProfile(key, value);
  };

  /** 1. 기존 리스트에서 기술 스택 선택 시 추가 */
  const handleAddTech = (e: React.SyntheticEvent, tech: TechStackItem) => {
    e.preventDefault();
    e.stopPropagation();

    const currentStacks = profile?.techStacks || [];

    // 중복 체크
    if (currentStacks.some((item) => item.id === tech.id)) {
      setSearchKeword('');
      setSearchResult([]);
      return;
    }

    const newStacks = [...currentStacks, tech];
    handleFieldChange('techStacks', newStacks);
    setSearchKeword('');
    setSearchResult([]);
  };

  /** 2. 새로운 기술 스택 서버 등록 후 추가 (POST /api/tech-stacks) */
  const handleCreateAndAddTech = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!searchKeyword.trim() || isCreating) return;

    try {
      setIsCreating(true);
      // 서버 전송 (Request Body: { name: string })
      const res = await techService.update({ name: searchKeyword.trim() });

      // 서버 응답 구조: res.techStack.id, res.techStack.name
      const newTech: TechStackItem = {
        id: res.techStack.id,
        name: res.techStack.name,
      };

      const currentStacks = profile?.techStacks || [];
      if (!currentStacks.some((item) => item.id === newTech.id)) {
        handleFieldChange('techStacks', [...currentStacks, newTech]);
      }

      setSearchKeword('');
      setSearchResult([]);
    } catch (error) {
      console.error('신규 기술 스택 등록 실패:', error);
      alert('기술 스택 등록 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  /** 기술 스택 삭제 */
  const handleRemoveTech = (techId: number | string) => {
    const currentStacks = profile?.techStacks || [];
    const newStacks = currentStacks.filter((item) => item.id !== techId);
    handleFieldChange('techStacks', newStacks);
  };

  /** 검색어 변경 핸들러 */
  const handleSearchKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeword(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 bg-orange-300 p-6">
      {/* 개발 경력 선택 */}
      <SelectBox
        keyType="career"
        label="개발 경력"
        placeholder="개발 경력을 선택해주세요"
        value={profile?.career}
        options={CAREER_OPTIONS}
        onChange={handleFieldChange}
      />

      {/* 공부 목적 선택 */}
      <SelectBox
        keyType="purpose"
        label="공부 목적"
        placeholder="공부의 목적을 선택해 주세요."
        value={typeof profile?.purpose === 'string' ? profile.purpose : '기타'}
        options={PURPOSE_OPTIONS}
        onChange={handleFieldChange}
      />

      {/* 공부 목표 입력 */}
      <div>
        <TextLabel name="goal" label="공부 목표" />
        <TextFieldInput
          name="goal"
          value={profile?.goal || ''}
          placeholder="공부 목표를 입력해 주세요."
          onChange={(e) => handleFieldChange('goal', e.target.value)}
        />
      </div>

      {/* 기술 스택 검색 및 등록 섹션 */}
      <div className="flex flex-col">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // 검색 결과가 있으면 첫 번째 항목 추가, 없으면 새로 생성
            if (searchResult.length > 0) {
              handleAddTech(e, { id: searchResult[0].id, name: searchResult[0].name });
            } else if (searchKeyword.trim() !== '') {
              handleCreateAndAddTech(e);
            }
          }}
        >
          <TextLabel name="skill" label="공부/사용 중인 기술 스택" />
          <div className="relative">
            <TextFieldInput
              value={searchKeyword}
              placeholder="기술 스택을 검색해 등록해 주세요."
              onChange={handleSearchKeywordChange}
            />
            <button type="submit" className="hidden" />

            {/* 자동완성 및 직접 추가 리스트 */}
            {searchKeyword.trim() !== '' && (
              <ul className="absolute top-[46px] z-50 max-h-52 w-full overflow-hidden overflow-y-auto rounded-sm border border-gray-300 bg-white shadow-lg">
                {/* 검색된 결과 렌더링 */}
                {searchResult.map((tech) => (
                  <li key={tech.id}>
                    <button
                      type="button"
                      className="hover:bg-brand-primary-10 w-full cursor-pointer px-4 py-3 text-left transition-colors"
                      onClick={(e) => handleAddTech(e, { id: tech.id, name: tech.name })}
                    >
                      {tech.name}
                    </button>
                  </li>
                ))}

                {/* 검색 결과가 없거나 커스텀 추가가 필요할 때 */}
                <li className="border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isCreating}
                    className="text-brand-primary flex w-full cursor-pointer items-center justify-between px-4 py-3 font-medium transition-colors hover:bg-gray-50"
                    onClick={(e) => handleCreateAndAddTech(e)}
                  >
                    <span>+ "{searchKeyword}" 직접 추가하기</span>
                    {isCreating && (
                      <span className="animate-spin text-xs text-gray-400">등록 중...</span>
                    )}
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* 선택 완료된 기술 스택 태그 노출 */}
          <div className="mt-4 flex flex-wrap gap-2 bg-red-200">
            {profile?.techStacks.map((item) => (
              <div
                key={item.id}
                className="bg-brand-primary-10 text-brand-primary border-brand-primary flex items-center gap-2 rounded-[5px] border px-[12px] py-[8px]"
              >
                <span className="text-sm font-medium">{item.name}</span>
                <button
                  type="button"
                  className="cursor-pointer transition-colors hover:text-red-500"
                  onClick={() => handleRemoveTech(item.id)}
                >
                  ⨉
                </button>
              </div>
            ))}
          </div>

          {/* 프로필 이미지 */}
          <div className="mt-[40px] mb-9 bg-green-200">
            <TextLabel label="프로필 이미지" name="ProfileImage" />
            <div>
              <div>+</div>
              <div>5MB 미만의 .png .jpg 파일</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
