import AddButton from '../AddButton';
import Dropdown from '../Dropdown';
import Input from '../Input';
import { FormHandles, Scope, useField } from '@unform/core';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa';

import styles from './styles.module.scss';
import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import Autocomplete from '../Autocomplete';

type Variation = {
  size?: number | string,
  stock?: number,
  color?: string,
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
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const { setLoading } = useLoading();

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
    setLoading(true)

    api.get('/size/all').then(response => {
      setSizes(response.data)
    }).catch((err) => {
      console.log(err);
    })

    api.get('/color/all').then(response => {
      setColors(response.data)
      setLoading(false)
    }).catch((err) => {
      console.log(err)
      setLoading(false)
    })
  }, [])

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
                    <Autocomplete
                      name={'size'}
                      items={sizes}
                      placeholder='Tamalho/medida'
                      autoComplete='off'
                    />
                    <Input
                      name='stock'
                      label={'Estoque'}
                      placeholder='Quantidade em estoque'
                      autoComplete='off'
                    />
                    <Autocomplete
                      name={'color'}
                      items={colors}
                      placeholder='Escolha a cor'
                      autoComplete='off'
                    />
                  </div>
                ) : (
                  <>
                    <Autocomplete
                      name={'size'}
                      items={sizes}
                      label='Tamanho/medida'
                      placeholder='Tamalho/medida'
                      autoComplete='off'
                    />
                    <Input
                      name='stock'
                      label={'Estoque'}
                      placeholder='Quantidade em estoque'
                      autoComplete='off'
                    />
                    <Autocomplete
                      name={'color'}
                      items={colors}
                      label='Cor'
                      placeholder='Escolha a cor'
                      autoComplete='off'
                    />
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

