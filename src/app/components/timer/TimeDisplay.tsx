import styles from './TimeDisplay.module.css';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const TimeDisplay = ({ unit, value }: { unit: string; value: string }) => {
  return (
    <div className={cx('timeField')}>
      <div className={cx('digitField')}>
        <div className={cx('digit')}>{value[0]}</div>
        <div className={cx('digit')}>{value[1]}</div>
      </div>
      <div className={cx('unit')}>{unit}</div>
    </div>
  );
};

TimeDisplay.displayName = 'TimeDisplay';
export default TimeDisplay;
