import { useField } from '@unform/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.scss';

type Radio = {
  name: string,
  label: string,
  value: string,
}

interface RadioButtonGroupProps {
  name: string;
  radios: Radio[];
  defaultRadio?: string;
}

interface InputRefProps extends HTMLInputElement {
  selectedRadio: string;
}

interface RadioRefProps extends HTMLDivElement {
  selectedRadio: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({ radios, name, defaultRadio, ...rest }: RadioButtonGroupProps) => {
  const radioRef = useRef<RadioRefProps>(null);
  const { fieldName, registerField, defaultValue = defaultRadio } = useField(name);

  const [radioValue, setRadioValue] = useState(defaultValue);
  const itemsRef = useMemo(() => Array(radios.length).fill(0).map(i => React.createRef<InputRefProps>()), [radios]);

  useEffect(() => {
    if (!!radioRef.current)
      radioRef.current.selectedRadio = radioValue;
  }, [radioValue])

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: radioRef.current,
      getValue: (ref: InputRefProps) => {
        return ref.selectedRadio || '';
      },
      clearValue: (ref: InputRefProps) => {
        if (!!ref)
          ref.selectedRadio = '';

        setRadioValue('');
      },
      setValue: (ref: InputRefProps, value) => {
        if (!!ref)
          ref.selectedRadio = value;

        setRadioValue(value);
      },
    });
  }, [fieldName, registerField, radioValue]);

  return (
    <>
      <div className={styles.radioContainer} ref={radioRef}>
        {
          radios.map((radio, i) => {
            return (
              <label key={radio.name} className={styles.radio}>
                <span className={styles.radioInput}>
                  <input
                    type='radio'
                    name={radio.name}
                    value={radio.value}
                    ref={itemsRef[i]}
                    className={styles.radiol}
                    onChange={() => {
                      setRadioValue(radio.value)
                    }}
                    checked={radioValue === radio.value} />
                  <span className={styles.radioControl}></span>
                </span>
                <span className={styles.radioLabel}>{radio.label}</span>
              </label>
            )
          })
        }
      </div>
    </>
  )
}

export default RadioButtonGroup;
