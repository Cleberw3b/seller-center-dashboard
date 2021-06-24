import { useField } from '@unform/core';
import React, { InputHTMLAttributes, useCallback, useMemo, useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import styles from './styles.module.scss';

interface AutocompleteProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string,
  items: Array<string>;
  setSelectedItem?: Function;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ name, label, className, items, setSelectedItem, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { fieldName, defaultValue, error, registerField } = useField(name);

  const [inputValue, setInputValue] = useState();
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!defaultValue);

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  const handleInputFocused = useCallback(() => {
    setIsFocused(true);
  }, [selectedSuggestion]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    setShowSuggestions(false)
    setFilteredSuggestions([]);

    if (selectedSuggestion === -1 && !!isFilled) {
      console.log(`Uepa ${selectedSuggestion}`);

      if (!!inputRef.current)
        inputRef.current.value = ''
    }
  }, [isFilled, selectedSuggestion]);

  const handleInputChange = useCallback((value: string) => {
    if (value.trim().length) {
      let count = 0;
      const tempItems = items.filter(item => {
        const validItem = item.toString().toLocaleUpperCase().includes(value.trim().toLocaleUpperCase());

        if (validItem)
          count++;

        return validItem && count <= 4;
      });

      setShowSuggestions(tempItems.length > 0);
      setFilteredSuggestions(tempItems);
      setIsFilled(true);

      return;
    }

    if (!!setSelectedItem)
      setSelectedItem(-1);

    setSelectedSuggestion(-1);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  }, [isFocused, selectedSuggestion, showSuggestions, filteredSuggestions]);

  const handleOnClick = useCallback((value: string) => {
    const selectedIndex = items.findIndex(suggestion => suggestion === value);

    setSelectedSuggestion(selectedIndex);

    if (!!setSelectedItem)
      setSelectedItem(selectedIndex);

    if (!!inputRef.current)
      inputRef.current.value = value;

    setIsFilled(true);
    setShowSuggestions(false);

    setIsFocused(false);
    setShowSuggestions(false)
    setFilteredSuggestions([]);
  }, [selectedSuggestion]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    });
  }, [fieldName, registerField])

  return (
    <div
      className={styles.parent}
      onFocus={handleInputFocused}
      onBlur={handleInputBlur}
    >
      <div ref={containerRef} className={!!error ? styles.containerError : isFocused ? styles.containerFocused : isFilled ? styles.containerFilled : styles.container}>
        <div>
          {
            !!label ? (
              <>
                <label>{label}</label>
                <input
                  ref={inputRef}
                  onChange={(e) => {
                    setIsFilled(selectedSuggestion >= 0)
                    handleInputChange(e.target.value)
                  }}
                  {...rest}
                />
              </>
            ) : (
              <input
                ref={inputRef}
                onChange={(e) => {
                  setIsFilled(selectedSuggestion >= 0)
                  handleInputChange(e.target.value)
                }}
                {...rest}
              />
            )
          }
        </div>
      </div>
      {
        !!filteredSuggestions && (
          <ul className={styles.suggestions}
            onMouseDown={(e) => e.preventDefault()}
            style={{ width: containerRef.current?.clientWidth }}
          >
            {
              filteredSuggestions.map((suggestion, i) => (
                <>
                  <li
                    key={suggestion}
                    className={(i >= 0 && i < filteredSuggestions.length - 1) ? styles.divider : ''}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleOnClick(suggestion);
                    }}
                    style={suggestion === items[selectedSuggestion] ? { backgroundColor: 'var(--green-100-25)' } : {}}
                  >
                    {suggestion}
                  </li>
                </>
              ))
            }
          </ul>
        )
      }
    </div>
  )
}

export default Autocomplete;
