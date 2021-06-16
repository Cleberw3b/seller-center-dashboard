import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import Dropzone from '../../../components/Dropzone';
import Button from '../../../components/PrimaryButton';
import ImageCard from '../../../components/ImageCard';
import Input from '../../../components/Input';
import RadioButtonGroup from '../../../components/RadioButtonGroup';
import VariationsController from '../../../components/Variations';
import getValidationErrors from '../../../utils/getValidationErrors';


import { FiChevronLeft, FiX } from 'react-icons/fi';

import styles from './styles.module.scss'

import { format } from 'date-fns';

export type Product = {
  images: {
    id: any,
    name: string,
    alt_text: string,
    url: string,
  }[],
  name: string,
  description: string,
  brand: string,
  more_info?: string,
  ean?: string,
  sku: string,
  height?: number,
  width?: number,
  length?: number,
  weight?: number,

  variations: {
    type: 'number' | 'size',
    value: number | string,
    stock: number,
    color: string,
    price: number,
  }[],

  nationality: {
    id: any,
    name: string,
  },
  category: {
    id: any,
    name: string,
    sub_category: [
      {
        id: any,
        name: string,
      }
    ]
  },
}

export function ProductEdit() {
  const [filesUrl, setFilesUrl] = useState<string[]>([]);

  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(10 + (3 * 4));

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const handleDeleteFile = useCallback((file: string) => {
    URL.revokeObjectURL(file);
    setFilesUrl(filesUrl.filter(f => f !== file));
  }, [filesUrl])

  const calcTotalFields = useCallback((data: Product) => {
    setTotalFields(9 + data.variations?.length * 3);
  }, [totalFields]);

  const calcFilledFields = useCallback((data: Product) => {
    console.log(data);

    let filled = 0;

    if (data.name)
      filled++;
    if (data.brand)
      filled++;
    if (data.description)
      filled++;
    if (data.ean)
      filled++;
    if (data.sku)
      filled++;
    if (data.height)
      filled++;
    if (data.width)
      filled++;
    if (data.length)
      filled++;
    if (data.weight)
      filled++;
    data.variations.forEach(variation => {
      !!variation.type && filled++;
      !!variation.stock && filled++;
      !!variation.color && filled++;
      !!variation.value && filled++;
    })

    setFilledFields(filled);
  }, [filesUrl, filledFields, totalFields])

  const handleSubmit = useCallback(async (data: Product) => {

    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        images: Yup.array().min(1, 'Escolha pelo menos \numa imagem'),
        name: Yup.string().required('Campo obrigatório'),
        description: Yup.string()
          .required('Campo obrigatório'),
        brand: Yup.string().required('Campo obrigatório'),
        more_info: Yup.string(),
        ean: Yup.string().required('Campo obrigatório'),
        sku: Yup.string(),
        height: Yup.string(),
        width: Yup.string(),
        length: Yup.string(),
        weight: Yup.string(),
        variations: Yup.array().required().of(Yup.object().shape({
          type: Yup.string().equals(['number', 'size']),
          size: Yup.mixed().when('type', {
            is: (val: 'number' | 'size') => val === 'number',
            then: Yup.number().required('Campo obrigatório'),
            otherwise: Yup.string().required('Campo obrigatório'),
          }),
          color: Yup.string().required('Campo obrigatório'),
          stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
          price: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório'),
        })),

        // password: Yup.string().when('old_password', {
        //   is: val => !!val.length,
        //   then: Yup.string().required('Campo obrigatório'),
        //   otherwise: Yup.string(),
        // }),
        // password_confirmation: Yup.string()
        //   .when('old_password', {
        //     is: val => !!val.length,
        //     then: Yup.string().required('Campo obrigatório'),
        //     otherwise: Yup.string(),
        //   })
        //   .oneOf([Yup.ref('password')], 'Confirmação incorreta'),
      });
      await schema.validate(data, { abortEarly: false });

      const {
        category,
        subCategory,
        nationallity
      } = router.query;


      // const {
      //   name,
      //   email,
      //   password,
      //   old_password,
      //   password_confirmation,
      // } = data;

      // const formData = {
      //   name,
      //   email,
      //   ...(data.old_password
      //     ? {
      //       old_password,
      //       password,
      //       password_confirmation,
      //     }
      //     : {}),
      // };

      //TODO: chamada para a API
      // const response = await api.post('/product', formData);

      router.push('/products');

      // addToast({
      //   type: 'success',
      //   title: 'Perfil atualizado!',
      //   description:
      //     'Suas informações do perfil foram alteradas com sucesso!',
      // });
    } catch (err) {
      console.log(err)
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        formRef.current?.setErrors(errors);

        return;
      }
    }
  }, [router])

  return (
    <>
      <main className={styles.container}>
        <section className={styles.header}>
          <Button
            customStyle={{ className: styles.backButton }}
            onClick={() => router.back()}
            icon={FiChevronLeft}
          >
            Voltar
          </Button>
        </section>
        <div className={styles.divider} />
        <section className={styles.content}>
          <Form ref={formRef} onSubmit={handleSubmit} onChange={(e) => {
            calcTotalFields(formRef.current?.getData() as Product);
            calcFilledFields(formRef.current?.getData() as Product);
          }}>
            <p className={styles.imagesTitle}>Seleciones as fotos do produto</p>
            <div className={styles.imagesContainer}>
              {/* TO-DO  AJUSTAR DROPZONE */}

              {/* <Dropzone name='images' filesUrl={filesUrl} setFilesUrl={setFilesUrl} onFileUploaded={() => { }}></Dropzone>
              {
                filesUrl.map((file, i) => (
                  <ImageCard key={i} onClick={() => handleDeleteFile(file)} imgUrl={file} />
                ))
              } */}
            </div>
            <div className={styles.doubleInputContainer}>
              <Input
                name='name'
                label='Nome do produto'
                placeholder='Insira o nome do produto'
                autoComplete='off'
              />
              <Input
                name='description'
                label='Descrição do produto'
                placeholder='Insira a descrição do produto'
                autoComplete='off'
              />
            </div>
            <div className={styles.doubleInputContainer}>
              <Input
                name='brand'
                label='Marca'
                placeholder='Insira a marca'
                autoComplete='off'
              />
              <Input
                name='more_info'
                label='Mais informações (opcional)'
                placeholder='Informações adicionais do produo'
                autoComplete='off'
              />
            </div>
            <div className={styles.titledContainer}>
              <p className={styles.title}>Selecione o gênero</p>
              <RadioButtonGroup
                name='gender'
                defaultRadio='M'
                radios={[
                  { name: 'masculino', value: 'M', label: 'Masculino' },
                  { name: 'feminino', value: 'F', label: 'Feminino' },
                  { name: 'unissex', value: 'U', label: 'Unissex' }]}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name='ean'
                label='EAN'
                placeholder='Código EAN do produto'
                autoComplete='off'
              />
              <Input
                name='sku'
                label='SKU'
                placeholder='SKU do produto'
                autoComplete='off'
              // disabled //TODO: gerar automagico o SKU
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name='heigth'
                label='Alturam (cm)'
                placeholder='Altura do produto'
                autoComplete='off'
              />
              <Input
                name='width'
                label='Largura (cm)'
                placeholder='Largura do produo'
                autoComplete='off'
              />
              <Input
                name='length'
                label='Comprimento (cm)'
                placeholder='Comprimento do produo'
                autoComplete='off'
              />
              <Input
                name='weight'
                label='Peso (kg)'
                placeholder='Peso do produo'
                autoComplete='off'
              />
            </div>
            <div className={styles.variationsContainer}>
              <div className={styles.variationsContainerTitle}>
                <div className={styles.variationsTitle}>
                  <h3>Informações das variações do produto</h3>
                  <span>Preencha <b>todos</b> os campos</span>
                </div>
              </div>
              <VariationsController name='variations' />
            </div>
          </Form>
        </section>
      </main>

      <div className={styles.footerContainer}>
        <span>{filledFields}/{totalFields} Informações inseridas</span>
        <Button type='submit' onClick={() => { formRef.current?.submitForm() }}>Salvar produto</Button>
      </div>
    </>
  );
}

export default ProductEdit;
