import AddButton from '../AddButton';
import Dropdown from '../Dropdown';
import Input from '../Input';
import { FormHandles, Scope, useField } from '@unform/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import styles from './styles.module.scss';

type Variation = {
  type?: 'number' | 'size',
  value?: number | string,
  stock?: number,
  color?: string,
  price?: number,
}

interface VariationsControllerProps {
  name: string;
  initial_vars?: Variation[];
}

interface VariationRefProps extends FormHandles {
  variations: Variation[];
}

const VariationsController: React.FC<VariationsControllerProps> = ({ name, initial_vars }: VariationsControllerProps) => {
  const variationsRef = useRef<VariationRefProps>(null);
  const { fieldName, registerField, defaultValue = [{}] } = useField(name);

  const [variations, setVariations] = useState<Variation[]>((!!initial_vars && initial_vars.length) > 0 ? initial_vars : defaultValue);

  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}])
  }, [variations]);

  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight }
    }

    return {
      width: undefined,
      height: undefined,
    }
  }, [process.browser]);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: variationsRef.current,
      getValue: (ref: VariationRefProps) => {
        return ref?.variations || [];
      },
      clearValue: (ref: VariationRefProps) => {
        ref.variations = [{}, {}, {}];
        setVariations([{}, {}, {}])
      },
      setValue: (ref: VariationRefProps, value) => {
        ref.variations = value;
        setVariations(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className={styles.controllerContainer}>
      {
        variations.map((variation, i) => {
          return (
            <Scope key={i} path={`variations[${i}]`}>
              <div className={(!!width && width < 768) ? styles.variationContainerMobile : styles.variationContainer}>
                <span>Variação {i + 1}</span>
                {(!!width && width < 768) ? (
                  <div className={styles.fieldsContainer}>
                    <Input
                      name='size'
                      label={'Tamanho/medida'}
                      placeholder='Tamanho/medida'
                      autoComplete='off'
                    />
                    <Input
                      name='stock'
                      label={'Estoque'}
                      placeholder='Quantidade em estoque'
                      autoComplete='off'
                    />
                    <Dropdown
                      name='color'
                      label='Escolha a cor'
                      options={[{ value: 'blue', label: 'Azul' }, { value: 'yellow', label: 'Amarela' }, { value: 'black', label: 'Preta' }, { value: 'pink', label: 'Rosa' }, { value: 'red', label: 'Vermelha' }, { value: 'Green', label: 'Verde' }, { value: 'other', label: 'Outra' }]} />
                  </div>
                ) : (
                  <>
                    <Input
                      name='size'
                      label={'Tamanho/medida'}
                      placeholder='Tamanho/medida'
                      autoComplete='off'
                    />
                    <Input
                      name='stock'
                      label={'Estoque'}
                      placeholder='Quantidade em estoque'
                      autoComplete='off'
                    />
                    <Dropdown
                      name='color'
                      label='Escolha a cor'
                      options={[{ value: 'blue', label: 'Azul' }, { value: 'yellow', label: 'Amarela' }, { value: 'black', label: 'Preta' }, { value: 'pink', label: 'Rosa' }, { value: 'red', label: 'Vermelha' }, { value: 'Green', label: 'Verde' }, { value: 'other', label: 'Outra' }]} />
                  </>
                )}
              </div>
            </Scope>
          )
        })
      }
      <div className={styles.addButtonContainer}>
        <AddButton icon={FaPlus} onClick={handleAddVariation} type='button'><span>Adicionar variação</span></AddButton>
      </div>
    </div >
  )
}

export default VariationsController;
function registerField(arg0: { name: any; ref: any; getValue: (ref: any) => any; clearValue: (ref: any) => void; setValue: (ref: any, value: any) => void; }) {
  throw new Error('Function not implemented.');
}

