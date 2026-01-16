import styles from './Logo.module.css';
import LogoH from '@/app/components/ui/LogoH';
import LogoV from '@/app/components/ui/LogoV';

export type LogoProps = {
  direction: 'horizontal' | 'vertical';
  color?: 'default' | 'white';
  width: string;
  height: string;
};

export default function Logo({
  direction,
  color = 'default',
  width,
  height,
}: LogoProps) {
  const Svg = direction === 'horizontal' ? LogoH : LogoV;
  return (
    <span>
      <Svg color={color} width={width} height={height} />
    </span>
  );
}
