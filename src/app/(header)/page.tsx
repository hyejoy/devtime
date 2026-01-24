'use client';

import Link from 'next/link';
import { useDialog } from '../components/dialog/dialogContext';

export default function Page() {
  const dialog = useDialog();

  const onClick = () => {
    dialog?.openModal();
  };

  return (
    <>
      <h1>Main Page</h1>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Link href="/signup">회원가입</Link>
        <Link href="/login">로그인</Link>
      </div>
      {/* <DialogField>
        <DialogField.Title
          type="text"
          title="프로필 설정을 건너뛸까요?"
          onClick={onClick}
        />
        <DialogField.Content>
          <div>
            프로필을 설정하지 않을 경우 일부 기능 사용에 제한이 생길 수
            있습니다. 그래도 프로필 설정을 건너뛰시겠습니까?
          </div>
        </DialogField.Content>
        <DialogField.Button align="align-right">
          <Button variant="secondary">건너뛰기</Button>
          <Button>계속 설정하기</Button>
        </DialogField.Button>
      </DialogField> */}
    </>
  );
}
