import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import Dropzone from '../../../../components/Dropzone';
import Button from '../../../../components/PrimaryButton';
import ImageCard from '../../../../components/ImageCard';
import Input from '../../../../components/Input';
import RadioButtonGroup from '../../../../components/RadioButtonGroup';
import VariationsController from '../../../../components/VariationsController';
import getValidationErrors from '../../../../utils/getValidationErrors';

import { FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';

import styles from './styles.module.scss'

import api from 'src/services/api';
import { useAuth } from 'src/hooks/auth';
import { Product, ProductImage } from 'src/shared/types/product';
import TextArea from 'src/components/Textarea';
import { useLoading } from 'src/hooks/loading';
import { useModalMessage } from 'src/hooks/message';
import { Loader } from 'src/components/Loader';
import MessageModal from 'src/components/MessageModal';
import Variation from 'src/components/VariationsController/Variation';
import { Attribute } from 'src/shared/types/category';

type VariationDTO = {
  size?: number | string,
  stock?: number,
  color?: string,
  flavor?: string;
  gluten_free?: boolean;
  lactose_free?: boolean;
}

export function ProductForm() {
  const [files, setFiles] = useState<ProductImage[]>([]);

  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(14);

  const [variations, setVariations] = useState<VariationDTO[]>([{}]);

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const breadCrumbs = useMemo(() => {
    return {
      category: router.query.categoryName,
      subCategory: router.query.subCategoryName,
      nationality: router.query.nationality === '1' ? 'Nacional' : 'Internacional'
    }
  }, [router])

  useEffect(() => {
    setLoading(true)

    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
    }).catch(err => {
      console.log(err)
    });

    api.get(`/category/${router.query.category}/attributes`).then(response => {
      console.log(response.data)
      setAttributes(response.data[0].attributes)

      setLoading(false)
    }).catch(err => {
      console.log(err)
      setLoading(false)
    })
  }, [])

  const handleOnFileUpload = useCallback((acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => {

    calcFilledFields(formRef.current?.getData() as Product);

    acceptedFiles = acceptedFiles.filter((f, i) => {

      if (files.length + (i + 1) > 8) {
        handleModalMessage(true, {
          type: 'error',
          title: 'Muitas fotos!',
          message: ['Um produto pode ter no m??ximo 8 fotos']
        })

        return false;
      }

      if (f.size / 1024 / 1024 > 2) {
        handleModalMessage(true, {
          type: 'error',
          title: 'Arquivo muito pesado!',
          message: [`O arquivo ${f.name} excede o tamanho m??ximo de 2mb`]
        })

        return false;
      }

      return true;
    })

    const newFiles = acceptedFiles.map(f => {
      return {
        file: f,
        url: URL.createObjectURL(f)
      } as ProductImage
    })

    dropZoneRef.current.acceptedFiles = [...files, ...newFiles].map(f => f.url);
    setFiles([...files, ...newFiles]);

  }, [files]);

  const handleDeleteFile = useCallback((file: string) => {
    URL.revokeObjectURL(file);

    const deletedIndex = files.findIndex(f => f.url === file);

    const filesUpdate = files.filter((f, i) => i !== deletedIndex);

    formRef.current?.setFieldValue('images', filesUpdate);
    setFiles(filesUpdate);

    calcFilledFields(formRef.current?.getData() as Product);
  }, [files])

  useEffect(() => {
    if (variations.length > 0) {
      setTotalFields(10 + variations.length * (attributes.length + 1))
      return;
    }

    setTotalFields(10 + (attributes.length + 1))
  }, [variations, attributes])

  const calcFilledFields = useCallback((data: Product) => {

    let filled = 0;

    if (data.name)
      filled++;
    if (data.brand)
      filled++;
    if (data.description)
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
      !!variation.flavor && filled++;

      attributes.map(attribute => {
        switch (attribute.name) {
          case 'gluten_free':
            filled++;
            break;
          case 'lactose_free':
            filled++;
            break;
        }
      })
    })

    setFilledFields(filled);
  }, [files, filledFields, totalFields, attributes])

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [])

  const yupVariationSchema = useCallback((): object => {

    return attributes.findIndex(attribute => attribute.name === 'flavor') >= 0 ?
      {
        variations: Yup.array().required().of(Yup.object().shape({
          size: Yup.string().required('Campo obrigat??rio'),
          flavor: Yup.string().required('Campo obrigat??rio'),
          stock: Yup.number().typeError('Campo obrigat??rio').required('Campo obrigat??rio').min(0, 'Valor m??nimo 0'),
        }))
      }
      :
      {
        variations: Yup.array().required().of(Yup.object().shape({
          size: Yup.string().required('Campo obrigat??rio'),
          color: Yup.string().required('Campo obrigat??rio'),
          stock: Yup.number().typeError('Campo obrigat??rio').required('Campo obrigat??rio').min(0, 'Valor m??nimo 0'),
        }))
      }
  }, [attributes])

  const handleSubmit = useCallback(async (data) => {
    if (filledFields < totalFields) {
      handleModalMessage(true, { type: 'error', title: 'Formul??rio incompleto', message: ['Preencha todas as informa????es obrigat??rias antes de continuar.'] })
      return;
    }

    if (data.price_discounted === "") {
      data.price_discounted = data.price;
    }

    try {
      setLoading(true)
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        images: Yup.array().min(2, 'Escolha pelo menos duas imagens').max(8, 'Pode atribuir no m??ximo 8 imagens'),
        name: Yup.string().required('Campo obrigat??rio').min(2, 'Deve conter pelo menos 2 caracteres'),
        description: Yup.string()
          .required('Campo obrigat??rio').min(2, 'Deve conter pelo menos 2 caracteres'),
        brand: Yup.string().required('Campo obrigat??rio').min(2, 'Deve conter pelo menos 2 caracteres'),
        ean: Yup.string(),
        sku: Yup.string().required('Campo obrigat??rio').min(2, 'Deve conter pelo menos 2 caracteres'),
        height: Yup.number().min(10, 'M??nimo de 10cm'),
        width: Yup.number().min(10, 'M??nimo de 10cm'),
        length: Yup.number().min(10, 'M??nimo de 10cm'),
        weight: Yup.number().required('Campo obrigat??rio'),
        gender: Yup.string(),
        price: Yup.number().required('Campo obrigat??rio'),
        price_discounted: Yup.number().nullable().min(0, 'Valor m??nimo de R$ 0').max(data.price, `Valor m??ximo de R$ ${data.price}`),
        ...yupVariationSchema()
      });

      await schema.validate(data, { abortEarly: false });

      const {
        category,
        subCategory,
        nationality
      } = router.query;

      var dataContainer = new FormData();

      files.forEach(f => {
        if (!!f.file)
          dataContainer.append("images", f.file, f.file.name)
      });

      const imagesUrls = await api.post('/product/upload', dataContainer, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        return response.data.urls
      });

      const {
        name,
        description,
        brand,
        ean,
        sku,
        gender,
        height,
        width,
        length,
        weight,
        price,
        price_discounted,
        variations
      } = data;

      // let formatedValidations = variations as Omit<VariationDTO, '_id'>[];
      variations.map((vars: any) => {
        delete vars._id;
      })

      const product = {
        category,
        subcategory: subCategory,
        nationality,
        name,
        description,
        brand,
        ean,
        sku,
        gender,
        height,
        width,
        length,
        weight,
        price,
        price_discounted,
        images: imagesUrls,
        variations
      }

      //TODO: chamada para a API
      await api.post('/product', product, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        setLoading(false)

        if (window.innerWidth >= 768) {
          router.push('/products');
          return;
        }

        router.push('/products-mobile');
      }).catch(err => {
        console.log(err.response.data);

        handleModalMessage(true, { title: 'Erro', message: ['Ocorreu um erro inesperado'], type: 'error' })
      });

      setLoading(false)

      // addToast({
      //   type: 'success',
      //   title: 'Perfil atualizado!',
      //   description:
      //     'Suas informa????es do perfil foram alteradas com sucesso!',
      // });
    } catch (err) {
      setLoading(false)
      console.log(err)
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);
        console.log(errors)
        formRef.current?.setErrors(errors);

        if (err.name = 'images') {
          handleModalMessage(true, {
            type: 'error',
            title: 'Erro!',
            message: [err.message]
          })
        }

        return;
      }
    }
  }, [router, token, user, filledFields, totalFields])

  async function handleDeleteVariation(deletedIndex: number): Promise<void> {
    setVariations(formRef.current?.getData().variations)

    const tempVars = formRef.current?.getData().variations;
    tempVars.splice(deletedIndex, 1);

    setVariations(tempVars)

    // formRef.current?.setFieldValue('variations', tempVars);
    formRef.current?.setData({ ...formRef.current?.getData(), variations: tempVars })
    calcFilledFields({ ...formRef.current?.getData(), variations: tempVars } as Product)
    setTotalFields(10 + tempVars.length * 3)
  }


  const handleAddVariation = useCallback(() => {
    setVariations([...variations, {}])
  }, [variations]);

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

          <div className={styles.breadCumbs}>
            {
              !!breadCrumbs.nationality && (
                <span className={!!breadCrumbs.category ? styles.crumb : styles.activeCrumb}>{breadCrumbs.nationality}</span>
              )
            }
            {
              !!breadCrumbs.category && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={!!breadCrumbs.subCategory ? styles.crumb : styles.activeCrumb}>{breadCrumbs.category}</span>
                </>
              )
            }
            {
              !!breadCrumbs.subCategory && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={styles.activeCrumb}>{breadCrumbs.subCategory}</span>
                </>
              )
            }
          </div>
        </section>

        <div className={styles.divider} />

        <section className={styles.content}>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            onChange={(e) => {
              calcFilledFields(formRef.current?.getData() as Product);
              // const formData = formRef.current?.getData() as Product;
              // setVariations(formData.variations);
            }}
          >
            <p className={styles.imagesTitle}>Seleciones as fotos do produto</p>

            <div className={styles.imagesContainer}>
              <Dropzone
                name='images'
                onFileUploaded={handleOnFileUpload}
              />

              {
                files.map((f, i) => {
                  if (!!f.url)
                    return <ImageCard key={i} onClick={() => handleDeleteFile(f.url as string)} imgUrl={f.url} />
                })
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
                name='brand'
                label='Marca'
                placeholder='Insira a marca'
                autoComplete='off'
              />
            </div>

            <div className={styles.singleInputContainer}>
              <TextArea
                name='description'
                label='Descri????o do produto'
                placeholder='Insira a descri????o do produto'
                autoComplete='off'
              />
            </div>

            <div className={styles.titledContainer}>
              <p className={styles.title}>Selecione o g??nero</p>

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
                placeholder='EAN do produto (opcional)'
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
                label='Pre??o (R$)'
                placeholder='Pre??o'
                autoComplete='off'
                type='number'
                min={0}
              />

              <Input
                name='price_discounted'
                label='Pre??o com desconto (R$)'
                placeholder='Pre??o com desconto (opcional)'
                autoComplete='off'
                type='number'
                min={0}
              />
            </div>

            <div className={styles.multipleInputContainer}>
              <Input
                name='height'
                label='Alturam da embalagem (cm)'
                placeholder='Altura'
                autoComplete='off'
                type='number'
              />

              <Input
                name='width'
                label='Largura da embalagem (cm)'
                placeholder='Largura da embalagem'
                autoComplete='off'
                type='number'
              />

              <Input
                name='length'
                label='Comprimento da embalagem (cm)'
                placeholder='Comprimento da embalagem'
                autoComplete='off'
                type='number'
              />

              <Input
                name='weight'
                label='Peso total (g)'
                placeholder='Peso total'
                autoComplete='off'
              />
            </div>

            <div className={styles.variationsContainer}>
              <div className={styles.variationsContainerTitle}>
                <div className={styles.variationsTitle}>
                  <h3>Informa????es das varia????es do produto</h3>
                  <span>Preencha <b>todos</b> os campos</span>
                </div>
              </div>

              <VariationsController handleAddVariation={handleAddVariation}>
                {
                  variations.map((variation, i) => {
                    return (
                      <Scope key={i} path={`variations[${i}]`}>
                        <Variation
                          variation={variation}
                          index={i}
                          handleDeleteVariation={() => handleDeleteVariation(i)}
                          attributes={attributes}
                          allowDelete={variations.length > 1}
                        />
                      </Scope>
                    )
                  })
                }
              </VariationsController>
            </div>
          </Form>
        </section>
      </div>

      <div className={styles.footerContainer}>
        <span>{filledFields}/{totalFields} Informa????es inseridas</span>
        {filledFields >= totalFields && <Button type='submit' onClick={() => { formRef.current?.submitForm() }}>Cadastrar produto</Button>}
      </div>

      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
      {
        showMessage && (
          <MessageModal handleVisibility={handleModalVisibility}>
            <div className={styles.modalContent}>
              {modalMessage.type === 'success' ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{modalMessage.title}</p>
              <p>{modalMessage.message}</p>
            </div>
          </MessageModal>
        )
      }
    </>
  );
}

export default ProductForm;
