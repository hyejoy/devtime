import TextLabel from '@/app/components/ui/TextLabel';
import { ProfilePostRequest } from '@/types/api';
import { OnChangeType } from '@/types/profile';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  name?: string;
  placeholder: string;
  options: Option[];
  keyType: keyof ProfilePostRequest;
  value: any;
  onChange: OnChangeType;
  error?: string;
}

export const SelectBox = ({
  label,
  name,
  placeholder,
  options,
  keyType,
  value,
  onChange,
  error,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // 현재 선택된 옵션의 라벨 찾기
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onChangeValue = (value: string) => {
    onChange(keyType, value);
    setIsOpen(false);
  };

  return (
    <div className="flex w-full flex-col" ref={containerRef}>
      {label && <TextLabel label={label} name={name || label} />}

      <div className="relative">
        {/* 셀렉트 박스 트리거 버튼 */}
        <button
          name={name || label}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex w-full items-center justify-between rounded-sm border',
            'bg-gray-50 px-4 py-3 text-sm transition-all outline-none',
            'focus:border-brand-primary focus:ring-brand-primary/10 focus:ring-4',
            isOpen ? 'border-brand-primary ring-brand-primary/10 ring-4' : 'border-none',
            !value ? 'text-gray-400' : 'text-gray-900'
          )}
        >
          <span>{selectedLabel || placeholder}</span>
          <ChevronDown
            size={20}
            className={clsx('transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        {/* 드롭다운 리스트 (ul, li) */}
        {isOpen && (
          <ul className="animate-in fade-in zoom-in-95 absolute z-50 mt-2 max-h-100 w-full overflow-auto rounded-sm border border-gray-300 bg-white p-1.5 shadow-xl duration-200">
            {options.map((option, idx) => (
              <li
                key={option.value}
                onClick={() => onChangeValue(option.value)}
                className={clsx(
                  idx === options.length - 1 ? 'none' : 'border-b border-gray-300',
                  'cursor-pointer px-3 py-4 text-sm transition-colors',
                  'hover:bg-brand-primary/5 hover:text-brand-primary',
                  value === option.value
                    ? 'text-primary-900 font-bold'
                    : 'hover:bg-brand-primary font-medium text-gray-600'
                )}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="ml-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
