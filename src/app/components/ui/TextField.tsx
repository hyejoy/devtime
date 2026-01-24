'use client';

import { ChangeEvent, HTMLInputTypeAttribute, forwardRef } from 'react';
import styles from './TextField.module.css';
import TextLabel from './TextLabel';
import TextFieldInput, { FeedbackMessageType } from './TextFieldInput';
import Button from './Button';

type Props = {
  name: string;
  placeholder: string;
  value: string;
  onChangeValue: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: HTMLInputTypeAttribute;
  label: string;
  buttonName?: string;
  feedbackMessage?: string;
  valiConfirm?: boolean;
};

const TextField = forwardRef<HTMLInputElement, Props>(
  (
    {
      name,
      placeholder,
      value,
      onChangeValue,
      type,
      label,
      buttonName,
      feedbackMessage = '',
      valiConfirm,
    },
    ref
  ) => {
    return (
      <div className={styles.textFieldContainer}>
        <TextLabel name={name} label={label} />
        <div className={styles.textField}>
          <TextFieldInput
            value={value}
            onChangeValue={(e) => onChangeValue(e)}
            ref={ref}
            name={name}
            placeholder={placeholder}
            type={type}
            feedbackMessage={feedbackMessage}
            valiConfirm={valiConfirm}
          />
          <Button variant="secondary" disabled={!valiConfirm}>
            {buttonName}
          </Button>
        </div>
      </div>
    );
  }
);

TextField.displayName = 'TextField';
export default TextField;
