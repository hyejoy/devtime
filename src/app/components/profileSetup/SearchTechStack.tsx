'use-client';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import { techService } from '@/services/techService';
import { useProfileStore } from '@/store/profileStore';
import { TechStackGetResponse } from '@/types/api';
import { OnChangeType } from '@/types/profile';
import { Loader2, XIcon } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

export default function SearchTechStack() {
  /** zustand */
  const { profile } = useProfileStore();
  const { setProfile } = useProfileStore((state) => state.actions);

  const [searchKeyword, setSearchKeword] = useState('');
  const [searchResult, setSearchResult] = useState<TechStackGetResponse>([]);
  const [isCreating, setIsCreating] = useState(false);

  /** 공통 필드 변경 핸들러 */
  const handleFieldChange: OnChangeType = (key, value) => {
    setProfile(key, value);
  };

  /** 1. 기존 리스트에서 기술 스택 선택 시 추가 */
  const handleAddTech = (e: React.SyntheticEvent, tech: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentStacks = profile?.techStacks || [];

    // 중복 체크
    if (currentStacks.some((item) => item === tech)) {
      setSearchKeword('');
      setSearchResult([]);
      return;
    }

    const newStacks = [...currentStacks, tech];
    handleFieldChange('techStacks', newStacks);
    setSearchKeword('');
    setSearchResult([]);
  };

  /** 검색어 변경 핸들러 */
  const handleSearchKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeword(e.target.value);
  };

  /** 기술 스택 삭제 */
  const handleRemoveTech = (techName: string) => {
    const currentStacks = profile?.techStacks || [];
    const newStacks = currentStacks.filter((item) => item !== techName);
    handleFieldChange('techStacks', newStacks);
  };

  /** 2. 새로운 기술 스택 서버 등록 후 추가 (POST /api/tech-stacks) */
  const handleCreateAndAddTech = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const newTech = searchKeyword.trim();
    if (!newTech || isCreating) return;

    try {
      setIsCreating(true);
      // 서버 전송 (Request Body: { name: string })
      const res = await techService.update({ name: newTech });

      // 서버 응답 구조: res.techStack.id, res.techStack.name

      if (!res) throw new Error('새로운 기술 스택 서버 등록 실패');

      const currentStacks = profile?.techStacks || [];
      if (!currentStacks.some((item) => item === newTech)) {
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
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // 검색 결과가 있으면 첫 번째 항목 추가, 없으면 새로 생성
          if (searchResult.length > 0) {
            handleAddTech(e, searchResult[0].name);
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
                    onClick={(e) => handleAddTech(e, tech.name)}
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
                  {/* 로딩바 */}
                  {isCreating && <Loader2 className="text-brand-primary h-4 w-4 animate-spin" />}
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* 선택 완료된 기술 스택 태그 노출 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {profile?.techStacks.map((item) => (
            <div
              key={item}
              className="bg-brand-primary-10 text-brand-primary border-brand-primary flex items-center gap-2 rounded-[5px] border px-[12px] py-[8px]"
            >
              <span className="text-sm font-medium">{item}</span>
              <XIcon
                className="h-5 w-5 cursor-pointer transition-colors hover:text-red-500"
                onClick={() => handleRemoveTech(item)}
              />
            </div>
          ))}
        </div>
      </form>
    </>
  );
}
