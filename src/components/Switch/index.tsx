import React, { InputHTMLAttributes, useRef, useState } from 'react';

import styles from './styles.module.scss';

type SwitchProps = InputHTMLAttributes<HTMLInputElement> & {
  isOn: boolean;
  onColor: string;
  offColor: string;
  handleToggle: any;
  item: any;
  id: string;
};

const Switch = ({ id, item, handleToggle, isOn, onColor, offColor, ...rest }: SwitchProps) => {
  const [checked, setChecked] = useState(isOn);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        checked={isOn}
        onChange={() => handleToggle(id)}
        className={styles.react_switch_checkbox}
        id={'react_switch_new'}
        type="checkbox"
        style={{}}
      />
      <label
        style={{
          background: isOn ? onColor : offColor, boxShadow: `0 0 1rem ${isOn ? onColor : offColor}4D, 0 0 1rem ${isOn ? onColor : offColor}BF`
        }}
        className={styles.react_switch_label}
        htmlFor={'react_switch_new'}
      >
        <span className={styles.react_switch_button} />
      </label>
      {/* <label>{text}</label> */}
    </>
  );
};

export default Switch;
