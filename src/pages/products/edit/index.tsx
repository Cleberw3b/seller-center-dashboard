import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

// import Dropzone from '../../../components/Dropzone';
import Button from '../../../components/PrimaryButton';
import ImageCard from '../../../components/ImageCard';
import Input from '../../../components/Input';
import RadioButtonGroup from '../../../components/RadioButtonGroup';
import VariationsController from '../../../components/VariationsController';
import getValidationErrors from '../../../utils/getValidationErrors';

import { FiAlertTriangle, FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';

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
import Dropzone from 'src/components/Dropzone';

type VariationDTO = {
  _id?: string;
  size?: number | string,
  stock?: number,
  color?: string,
}

export function EditProductForm() {
  const [files, setFiles] = useState<ProductImage[]>([]);
  const [filesUrl, setFilesUrl] = useState<string[]>([]);

  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(14);

  const [variations, setVariations] = useState<VariationDTO[]>([{}]);
  const [nationality, setNationality] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [genderRadio, setGenderRadio] = useState('M');

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { user, token, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();
  const { showModalMessage: showMessage, modalMessage, handleModalMessage } = useModalMessage();

  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    // setLoading(true)
    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
    }).catch(err => {
      console.log(err)
    });
  }, [])


  useEffect(() => {
    // api.get('/account/detail').then(response => {
    //   updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
    // }).catch(err => {
    //   console.log(err)
    // });

    setLoading(true);

    if (!!formRef.current && !!user) {
      const { id } = router.query;

      api.get(`/product/${id}`, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        console.log(response.data)

        const urls = response.data.images.filter((url: string) => (!!url && url !== null));
        setFilesUrl(urls)

        let files: ProductImage[]
        files = urls.map((url: string) => {
          return {
            url
          } as ProductImage
        })

        setFiles(files);

        setGenderRadio(response.data.gender)

        setVariations(response.data.variations)

        setNationality(response.data.nationality)
        setCategory(response.data.category)
        setSubCategory(response.data.subcategory)

        formRef.current?.setData(response.data)
        // setFormData(response.data);

        setLoading(false)
      }).catch(err => {
        console.log(err)

        setLoading(false)
        handleModalMessage(true, { title: 'Erro', message: ['Erro ao carregar o produto'], type: 'error' })
      })
    }
  }, [user, formRef])

  useEffect(() => {
    setLoading(true)

    if (!!category && category.length > 0) {
      api.get(`/category/${category}/attributes`).then(response => {
        setAttributes(response.data[0].attributes)

        setFilledFields(10 + variations.length * (response.data[0].attributes.length + 1))

        setLoading(false)
      }).catch(err => {
        console.log(err)

        setLoading(false)
      })
    }
  }, [category])

  const handleOnFileUpload = useCallback((acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => {
    calcFilledFields(formRef.current?.getData() as Product);

    acceptedFiles.filter(f => {
      if (f.size / 1024 / 1024 > 5) {
        handleModalMessage(true, {
          type: 'error',
          title: 'Arquivo muito pesado!',
          message: [`O arquivo ${f.name} excede o tamanho m??ximo de 5mb`]
        })

        return false;
      }

      return true;
    })

    const newFiles = acceptedFiles.map(f => {
      return {
        file: f
      } as ProductImage
    })

    let urls: string[] = [];
    newFiles.forEach(f => {
      urls.push(URL.createObjectURL(f.file))
    })

    dropZoneRef.current.acceptedFiles = [...files, ...newFiles].map(f => f.url);
    setFiles([...files, ...newFiles]);
    setFilesUrl([...filesUrl, ...urls]);
  }, [files]);

  const handleDeleteFile = useCallback((url: string) => {
    URL.revokeObjectURL(url);

    const deletedIndex = files.findIndex(f => f.url === url);

    const urlsUpdate = filesUrl.filter((f, i) => i !== deletedIndex);
    const filesUpdate = files.filter((f, i) => i !== deletedIndex);

    formRef.current?.setFieldValue('images', filesUpdate);
    setFilesUrl(urlsUpdate);
    setFiles(filesUpdate);

    calcFilledFields(formRef.current?.getData() as Product);
  }, [filesUrl])

  useEffect(() => {
    if (variations.length > 0) {
      setTotalFields(10 + variations.length * (attributes.length + 1))
      return;
    }

    setTotalFields(10 + (attributes.length + 1))
    setFilledFields(10 + (attributes.length + 1))
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
    if (filesUrl.length > 0)
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
  }, [filesUrl, filledFields, totalFields, attributes])

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
        images: Yup.array().min(1, 'Escolha pelo menos \numa imagem'),
        name: Yup.string().required('Campo obrigat??rio').min(2, "Deve conter pelo menos 2 caracteres"),
        description: Yup.string()
          .required('Campo obrigat??rio').min(2, "Deve conter pelo menos 2 caracteres"),
        brand: Yup.string().required('Campo obrigat??rio').min(2, "Deve conter pelo menos 2 caracteres"),
        ean: Yup.string(),
        sku: Yup.string().required('Campo obrigat??rio'),
        height: Yup.number().min(10, 'M??nimo de 10cm'),
        width: Yup.number().min(10, 'M??nimo de 10cm'),
        length: Yup.number().min(10, 'M??nimo de 10cm'),
        weight: Yup.number().required('Campo obrigat??rio'),
        gender: Yup.string(),
        price: Yup.number().required('Campo obrigat??rio'),
        price_discounted: Yup.number().nullable().min(0, 'Valor m??nimo de R$ 0').max(data.price, `Valor m??ximo de R$ ${data.price}`),
        ...yupVariationSchema(),
      });

      await schema.validate(data, { abortEarly: false });

      const {
        id
      } = router.query;

      var dataContainer = new FormData();

      files.forEach((f, i) => (!!f.file && !f.url) && dataContainer.append("images", f.file, f.file.name));

      const oldImages = files.map(f => {
        if (!!f.url && !f.file)
          return f.url
      })

      let newImages = await api.post('/product/upload', dataContainer, {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        return response.data.urls as string[]
      });

      if (!!oldImages)
        newImages = [...oldImages as string[], ...newImages];

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
        images: newImages,
        //variations
      }

      await variations.forEach(async (variation: VariationDTO) => {
        if (!!variation._id && variation._id !== '') {
          const variationId = variation._id

          delete variation._id

          await api.patch(`/product/${id}/variation/${variationId}`, variation, {
            headers: {
              authorization: token,
              shop_id: user.shopInfo._id,
            }
          }).then(response => {

          })

          return;
        }

        delete variation._id

        await api.post(`/product/${id}/variation`, variation, {
          headers: {
            authorization: token,
            shop_id: user.shopInfo._id,
          }
        }).then(response => {

        })
      })

      await api.patch(`/product/${id}`, product, {
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
      })

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
        formRef.current?.setErrors(errors);

        return;
      }
    }
  }, [router, token, user, files, filesUrl, filledFields, totalFields])

  // const handleDeleteVariation = useCallback((deletedIndex: number) => {
  //   console.log('Pr??-delete')
  //   console.log(variations)

  //   const tempVars = variations.filter((vars, i) => i !== deletedIndex);

  //   console.log('Deleted?')
  //   console.log(tempVars);

  //   setVariations(tempVars)
  // }, [variations])

  // const variationsController = useMemo(() => {
  //   console.log('Memo:')
  //   console.log(variations)

  //   return variations
  // }, [variations])

  async function handleDeleteVariation(deletedIndex: number): Promise<void> {
    setVariations(formRef.current?.getData().variations)

    const tempVars = variations.filter((vars, i) => i !== deletedIndex);
    const deletedVariation = variations[deletedIndex];

    setVariations(tempVars)

    formRef.current?.setFieldValue('variations', tempVars);
    formRef.current?.setData({ ...formRef.current?.getData(), variations: tempVars })

    const { id } = router.query;
    await api.delete(`/product/${id}/variation/${deletedVariation._id}`, {
      headers: {
        authorization: token,
        shop_id: user.shopInfo._id,
      },
    }).then(response => { })
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

          {/* TODO: Definir api para recuperar os dados das categorias */}

          {/* <div className={styles.breadCumbs}>
            {
              !!nationality && (
                <span className={!!category ? styles.crumb : styles.activeCrumb}>{nationality}</span>
              )
            }
            {
              !!category && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={!!subCategory ? styles.crumb : styles.activeCrumb}>{category}</span>
                </>
              )
            }
            {
              !!subCategory && (
                <>
                  <span className={styles.separator}>/</span>
                  <span className={styles.activeCrumb}>{subCategory}</span>
                </>
              )
            }
          </div> */}
        </section>
        <div className={styles.divider} />
        <section className={styles.content}>
          <Form ref={formRef} onSubmit={handleSubmit} onChange={(e) => {
            // console.log(formRef.current?.getData())
            calcFilledFields(formRef.current?.getData() as Product);
            // const formData = formRef.current?.getData() as Product;
            // console.log(formData.variations);
            // setVariations(formData.variations);
          }}>
            <p className={styles.imagesTitle}>Fotos do produto</p>
            <div className={styles.imagesContainer}>
              <Dropzone
                name='images'
                onFileUploaded={handleOnFileUpload}
              />
              {
                filesUrl.map((file, i) => (
                  <ImageCard key={i} onClick={() => handleDeleteFile(file)} imgUrl={file} />
                  // <ImageCard key={i} onClick={() => { }} imgUrl={file} showOnly />
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
                defaultRadio={genderRadio}
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
                placeholder='Largura'
                autoComplete='off'
                type='number'
              />
              <Input
                name='length'
                label='Comprimento da embalagem (cm)'
                placeholder='Comprimento'
                autoComplete='off'
                type='number'
              />
              <Input
                name='weight'
                label='Peso total (g)'
                placeholder='Peso'
                autoComplete='off'
                type='number'
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
                          handleDeleteVariation={handleDeleteVariation}
                          attributes={attributes}
                          allowDelete={i >= 1}
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

export default EditProductForm;
