'use client';
import classNames from 'classnames/bind';
import { JSX, ReactNode, useEffect } from 'react';
import Button from './Button';
import Content from './Content';
import { useDialog } from './dialogContext';
import styles from './DialogField.module.css';
import Title from './Title';
const cx = classNames.bind(styles);

interface DialogFieldComponent {
  Title: typeof Title;
  Content: typeof Content;
  Button: typeof Button;
  ({ children }: { children: ReactNode }): JSX.Element | null;
}
// Root 컴포넌트
const DialogField = (({ children }: { children: ReactNode }) => {
  const dialog = useDialog();
  if (!dialog) return null;

  // 모달 열릴때 body 스크롤 잠그기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={cx('overlay')}>
      <div className={cx('dialogContainer')}>
        <div className={cx('childrenContainer')}>{children}</div>
      </div>
    </div>
  );
}) as DialogFieldComponent;

// 하위 컴포넌트들을 네임스페이스로 매핑
DialogField.Title = Title;
DialogField.Content = Content;
DialogField.Button = Button;

export default DialogField;

// Compound Componenet 로 설계히보기
/**
 * 1. 모달이 가질 수 있는 상태
 * - 열림 / 닫힘
 * - 생성된 모달 창은 '취소' 버튼으로만 닫을 수 있고, 모달 바깥 영역을 누르더라도 모달이 꺼지지 않도록 제어한다.
 *
 * 2. 모달을 여는 쪽에서는 뭘 넘겨줘야할까
 * - isOpen
 * - onClosed (닫고 여는거 제어하는거)
 * - page (어느페이지인지 .. 타입?)
 *
 * ? context 사용여부는 O 아닐까?
 * - 왜냐하면, 컴포넌트를 랜더링하는 페이지에서도 모달을 부르고
 *   레이아웃에서도 모달을 사용하기때문에..?
 * - 궁금한점은 레이아웃에서 모달사용을 컴파운트 컴포넌트 형태로 만들어도 될까?
 * - 로그인모달, 무슨 모달 이렇게 안만들고 하나의 모달을 만들고싶어
 *  title 있고 취소, 확인 버튼
 * title 있고 확인 버튼
 * title없고 확인버튼
 * title 색도다르고 content도 완전다른 설정 모달
 */
