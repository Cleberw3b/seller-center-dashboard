import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import Dropzone from '../../../../components/Dropzone';
import Button from '../../../../components/PrimaryButton';
import ImageCard from '../../../../components/ImageCard';
import Input from '../../../../components/Input';
import RadioButtonGroup from '../../../../components/RadioButtonGroup';
import VariationsController from '../../../../components/Variations';
import getValidationErrors from '../../../../utils/getValidationErrors';

import { FiChevronLeft, FiX } from 'react-icons/fi';

import styles from './styles.module.scss'

import { format } from 'date-fns';
import api from 'src/services/api';
import { useAuth } from 'src/hooks/auth';

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
  price: number,
  price_discounted?: number;
  height?: number,
  width?: number,
  length?: number,
  weight?: number,

  variations: {
    size: number | string,
    stock: number,
    color: string,
  }[],

  nationality: string,
  category: string,
  sub_category: string,
}

type ProductDTO = {
  id: string;
  status: number;
  name: string;
  brand: string;
  sku: string;
  date: string;
  value: number;
  stock: number;
  image?: string;
}

export function ProductForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [filesUrl, setFilesUrl] = useState<string[]>([]);

  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(13);

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { user, token, updateUser } = useAuth();

  useEffect(() => {
    console.log(user)
    api.get('/account/detail').then(response => {
      console.log(response.data)
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
    }).catch(err => {
      console.log(err)
    });
  }, [])

  const handleOnFileUpload = useCallback((file: string[]) => {
    calcFilledFields(formRef.current?.getData() as Product);
  }, [filesUrl]);

  const handleDeleteFile = useCallback((file: string) => {
    URL.revokeObjectURL(file);

    const filesUpdate = filesUrl.filter(f => f !== file);

    formRef.current?.setFieldValue('images', filesUpdate);
    setFilesUrl(filesUpdate);

    calcFilledFields(formRef.current?.getData() as Product);
  }, [filesUrl])

  const calcTotalFields = useCallback((data: Product) => {
    if (!!data.variations) {
      setTotalFields(10 + data.variations?.length * 3);
      return;
    }

    setTotalFields(13);
  }, [totalFields, filledFields]);

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
    if (data.price)
      filled++;
    if (data.images?.length > 0)
      filled++;

    data.variations.forEach(variation => {
      !!variation.size && filled++;
      !!variation.stock && filled++;
      !!variation.color && filled++;
    })

    setFilledFields(filled);
  }, [filesUrl, filledFields, totalFields])

  const handleSubmit = useCallback(async (data: Product) => {

    if (filledFields < totalFields) {
      return;
    }

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
          // type: Yup.string().equals(['number', 'size']),
          // size: Yup.mixed().when('type', {
          //   is: (val: 'number' | 'size') => val === 'number',
          //   then: Yup.number().required('Campo obrigatório'),
          //   otherwise: Yup.string().required('Campo obrigatório'),
          // }),
          size: Yup.string().required('Campo obrigatório'),
          color: Yup.string().required('Campo obrigatório'),
          stock: Yup.number().typeError('Campo obrigatório').required('Campo obrigatório').min(0, 'Valor mínimo 0'),
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
        nationality
      } = router.query;

      console.log(`Category: ${category}`)
      console.log(`Sub-category: ${subCategory}`)
      console.log(`Nationallity: ${nationality}`)

      const {
        name,
        description,
        brand,
        more_info,
        ean,
        sku,
        height,
        width,
        length,
        weight,
        price,
        price_discounted,
        variations
      } = data;

      console.log(`Height: ${height}`)

      const product = {
        category,
        subCategory,
        nationality,
        name,
        description,
        brand,
        more_info,
        ean,
        sku,
        height,
        width,
        length,
        weight,
        price,
        price_discounted,
        variations,
      }

      var dataContainer = new FormData();

      Object.keys(product).forEach(key => dataContainer.append(key, product[key]));

      files.forEach(file => {
        console.log(`File: ${file.name}`)
        dataContainer.append("images", file, file.name)
      });

      // dataContainer.append("product", JSON.stringify(product));

      //TODO: chamada para a API
      const response = await api.post('/product', dataContainer, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        console.log(response.data)
      });

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
  }, [router, token, user, filledFields, totalFields])

  return (
    <>
      <div className={styles.container}>
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
              <Dropzone
                name='images'
                filesUrl={filesUrl}
                setFilesUrl={setFilesUrl}
                onFileUploaded={(files) => handleOnFileUpload(files)}
                files={files}
                setFiles={setFiles}
              />
              {
                filesUrl.map((file, i) => (
                  <ImageCard key={i} onClick={() => handleDeleteFile(file)} imgUrl={file} />
                ))
              }
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
                placeholder='Informações adicionais do produto'
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
              <Input
                name='price'
                label='Preço (R$)'
                placeholder='Preço'
                autoComplete='off'
                type='number'
                min={0}
              />
              <Input
                name='price_discounted'
                label='Preço com desconto (R$)'
                placeholder='Preço com desconto'
                autoComplete='off'
                type='number'
                min={0}
              />
            </div>
            <div className={styles.multipleInputContainer}>
              <Input
                name='height'
                label='Alturam (cm)'
                placeholder='Altura do produto'
                autoComplete='off'
              />
              <Input
                name='width'
                label='Largura (cm)'
                placeholder='Largura do produto'
                autoComplete='off'
              />
              <Input
                name='length'
                label='Comprimento (cm)'
                placeholder='Comprimento do produto'
                autoComplete='off'
              />
              <Input
                name='weight'
                label='Peso (kg)'
                placeholder='Peso do produto'
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
      </div>

      <div className={styles.footerContainer}>
        <span>{filledFields}/{totalFields} Informações inseridas</span>
        <Button type='submit' onClick={() => { formRef.current?.submitForm() }}>Cadastrar produto</Button>
      </div>
    </>
  );
}

export default ProductForm;
