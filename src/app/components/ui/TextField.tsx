'use client';

import { ChangeEvent, HTMLInputTypeAttribute, forwardRef } from 'react';
import styles from './TextField.module.css';
import TextLabel from './TextLabel';
import TextFieldInput, { FeedbackMessageType } from './TextFieldInput';
import Button from './Button';

type Props = {
  htmlFor: string;
  placeholder: string;
  value: string;
  onChangeValue: (text: string) => void;
  type?: HTMLInputTypeAttribute;
  label: string;
  buttonName?: string;
  feedbackMessage?: string;
  valiConfirm?: boolean;
};

const TextField = forwardRef<HTMLInputElement, Props>(
  (
    {
      htmlFor,
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
    const handleValue = (value: string) => {
      onChangeValue(value);
    };
    return (
      <div className={styles.textFieldContainer}>
        <TextLabel htmlFor={htmlFor} label={label} />
        <div className={styles.textField}>
          <TextFieldInput
            value={value}
            onChangeValue={handleValue}
            ref={ref}
            htmlFor={htmlFor}
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
