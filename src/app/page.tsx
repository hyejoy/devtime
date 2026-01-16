import Link from 'next/link';
import Button from './components/ui/Button';
import CheckBox from './components/ui/CheckBox';
import TextField from './components/ui/TextField';
import TextFieldButton from './components/ui/TextFieldButton';

// enable -> disabled -> hover-> active -> focus
export default function Home() {
  return (
    <>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button>Button</Button>
          <Button disabled={true}>Button</Button>
          <Button>Button</Button>
          <Button>Button</Button>
          <Button>Button</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary" disabled={true}>
            Button
          </Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary">Button</Button>
          <Button variant="secondary">Button</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="tertiary">Button</Button>
          <Button variant="tertiary" disabled={true}>
            Button
          </Button>
          <Button variant="tertiary">Button</Button>
          <Button variant="tertiary">Button</Button>
          <Button variant="tertiary">Button</Button>
        </div>
        <Link href={'/signup'}>회원가입</Link>
        {/*  */}
      </div>
      <hr />
    </>
  );
}
