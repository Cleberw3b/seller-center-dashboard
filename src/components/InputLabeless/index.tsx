import { useField } from '@unform/core';
import React, { InputHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import InputMask, { ReactInputMask } from 'react-input-mask';

import DatePicker from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';

import '../DatePickerInput/datepickerstyles.module.css';
import styles from './styles.module.scss';
import ReactDatePicker from 'react-datepicker';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  mask?: string | (string | RegExp)[];
  isDatePicker?: boolean;
  isMasked?: boolean;
  format?: Function;
  containerStyle?: object;
  showYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  scrollableYearDropdown?: boolean;
}

interface InputRefProps extends InputHTMLAttributes<HTMLInputElement> {
  maskRef?: React.RefObject<ReactInputMask>;
  inputRef?: React.RefObject<any>;
  dateRef?: React.RefObject<DatePicker>;
  name: string;
  defaultValue?: any;
  isMasked?: boolean;
  mask?: string | (string | RegExp)[];
  format?: any;
  setIsFocused: Function;
  setIsFilled: Function;
  showYearDropdown?: boolean;
  yearDropdownItemNumber?: number;
  scrollableYearDropdown?: boolean;
}

const InputDefault: React.FC<InputRefProps> = ({ maskRef, inputRef, name, isMasked, mask, placeholder, disabled, defaultValue, setIsFocused, setIsFilled, ...rest }) => {
  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!maskRef ? maskRef.current?.props.value : !!inputRef?.current?.value);
  }, []);

  return isMasked ? (
    <InputMask
      type='text'
      name={name}
      ref={inputRef}
      mask={!!mask ? mask : ''}
      placeholder={placeholder}
      onFocus={handleInputFocused}
      onBlur={handleInputBlur}
      {...rest}
      maskChar={null} />

  ) : (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      onFocus={handleInputFocused}
      onBlur={handleInputBlur}
      defaultValue={defaultValue}
      ref={inputRef}
      disabled={disabled}
      {...rest}
    />
  );
}

const InputDatePicker: React.FC<InputRefProps> = ({ dateRef, name, placeholder, disabled, defaultValue, setIsFilled, setIsFocused, showYearDropdown, yearDropdownItemNumber, scrollableYearDropdown }) => {
  const dateParts = !!defaultValue ? defaultValue.split('-') : null;
  const [inputDate, setInputDate] = useState(!!dateParts ? new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]) : null);

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!dateRef?.current?.props.selected);
  }, []);

  return (
    <DatePicker
      name={name}
      placeholderText={placeholder}
      selected={inputDate}
      onChange={(date) => {
        if (!!date)
          setInputDate(date as Date)
      }}
      onFocus={handleInputFocused}
      onBlur={handleInputBlur}
      onSelect={handleInputBlur}
      ref={dateRef}
      locale={pt}
      dateFormatCalendar="MMMM yyyy"
      formatWeekDay={formattedDate => { return formattedDate[0].toUpperCase() + formattedDate.substr(1, 2).toLowerCase() }}
      dateFormat='dd/MM/yyyy'
      todayButton='Hoje'
      className={styles.datePicker}
      showPopperArrow={false}
      closeOnScroll={true}
      disabledKeyboardNavigation={true}
      disabled={disabled}
      autoComplete='off'
      showYearDropdown={showYearDropdown}
      yearDropdownItemNumber={yearDropdownItemNumber}
      scrollableYearDropdown={scrollableYearDropdown}
    />
  )
}

const Input: React.FC<InputProps> = ({
  name,
  disabled,
  placeholder,
  isDatePicker,
  isMasked,
  mask,
  format,
  containerStyle = {},
  showYearDropdown, yearDropdownItemNumber, scrollableYearDropdown,
  ...rest
}) => {
  const dateRef = useRef<ReactDatePicker>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: !isDatePicker ? inputRef.current : dateRef.current,
      path: !isDatePicker ? 'value' : 'props.selected',
      // clearValue: (ref: any) => {
      //   isMasked ? ref.setInputValue('') : ref.current.value = ''
      // },
      clearValue: (ref: any) => {
        ref.clear();
      },
      setValue: (ref, value) => {
        if (!!ref && !!ref.current)
          !isDatePicker ? ref.current.value = value : ref.current.props.selected = value
      },
    });
  }, [fieldName, registerField]);

  return (
    <div style={containerStyle}>
      <div
        className={disabled ? styles.containerDisabled : !!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container} >
        {
          isDatePicker ?
            <InputDatePicker name={name} dateRef={dateRef} placeholder={placeholder} setIsFilled={setIsFilled} setIsFocused={setIsFocused} defaultValue={defaultValue} {...rest} />
            :
            isMasked ?
              <InputDefault name={name} inputRef={inputRef} placeholder={placeholder} isMasked={isMasked} mask={mask} format={format} disabled={disabled} {...rest} defaultValue={defaultValue} setIsFilled={setIsFilled} setIsFocused={setIsFocused} />
              :
              <InputDefault name={name} inputRef={inputRef} placeholder={placeholder} isMasked={isMasked} mask={mask} format={format} disabled={disabled} {...rest} defaultValue={defaultValue} setIsFilled={setIsFilled} setIsFocused={setIsFocused} />
        }
      </div>
      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
