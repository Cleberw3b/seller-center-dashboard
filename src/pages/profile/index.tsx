import React, { useCallback, useRef, ChangeEvent, useState, useMemo } from 'react';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { InactiveUserError } from 'src/shared/errors/InactiveUserError';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import AvatarInput from '../../components/AvatarInput';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLoading } from 'src/hooks/loading';
import { Loader } from 'src/components/Loader';
import Autocomplete from 'src/components/Autocomplete';
import { banks } from 'src/shared/consts/banks';
import { CompanyInfo, PersonInfo } from 'src/shared/types/personalInfo';
import UserTypeButton from 'src/components/UserTypeButton';
import { FaUserTie, FaStore } from 'react-icons/fa';

type ProfileFormData = {
  personalInfo: PersonInfo | CompanyInfo,

  address: {
    cep: string,
    address: string,
    number: number,
    complement: string,
    district: string,
    city: string,
  }

  email: string,
  // phone?: string,

  // commission: number,
  // role: string,

  bankInfo: {
    bank: string,
    name: string,
    account: string,
    agency: string,
    pix?: string,
  }

  contact: {
    phone?: string,
    url?: string,
  }

  shopInfo: {
    _id: string,
    name: string,
    cnpj: string,

    // address: string,
    // district: string,
    // city: string,
    // complement: string,
    // number: number,
  }
}

const ddRegex = /^\([1-9]{2}\)/
const phoneRegex = /(?:[2-8]|9[1-9])/
const endPhoneRegex = /[0-9]{3}\-[0-9]{4}$/

const completephoneRegex = /^\([1-9]{2}\)(?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/

const TYPE_INDEX = -1;
const PERSONAL_INDEX = 0;
const ADDRESS_INDEX = 1;
const CONTACT_INDEX = 2;
const SELLER_INDEX = 3;
const STORE_INDEX = 4;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isLoading, setLoading } = useLoading();

  const [flowIntent, setFlowIntent] = useState(true);
  const [flowStep, setFlowStep] = useState(-1);
  const [flowPrevious, setFlowPrevious] = useState(0);
  const [isStepCompleted, setStepCompleted] = useState(false);
  const [isChanged, setChanged] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  useEffect(() => {
    if (flowStep === -1) {
      setFlowStep(!!user && !!user.personalInfo ? 0 : -1);
    }
  }, [user])

  useEffect(() => {
    setLoading(true);
    api.get('/account/detail').then(response => {
      updateUser({ ...user, ...response.data })

      formRef.current?.setData({ ...user, ...response.data });

      setLoading(false);
    }).catch(err => {
      console.log(err)

      setLoading(false);
    });
  }, [])

  const yupValidationSchema = useMemo((): object => {
    switch (flowStep) {
      case PERSONAL_INDEX:
        if (!!user && user.userType === 'j')
          return {
            personalInfo: Yup.object().shape({
              name: Yup.string().required('Nome obrigatório'),
              razaoSocial: Yup.string().required('Razão Social obrigatório'),
              cnpj: Yup.string().required('CNPJ obrigatório').min(14, 'O CNPJ deve ter 14 digitos'),
              inscricaoMunicipal: Yup.string(),
              inscricaoEstadual: Yup.string(),
            })
          }

        return {
          personalInfo: Yup.object().shape({
            firstName: Yup.string().required('Nome obrigatório'),
            lastName: Yup.string().required('Sobrenome obrigatório'),
            cpf: Yup.string().required('CPF obrigatório').min(11, 'O CPF deve ter 11 digitos'),
            rg: Yup.string().required('RG obrigatório').min(9, 'RG deve ter 9 digitos'),
            birthday: Yup.date(),
          })

          //phone: Yup.string().required('Celular obrigatório').min(11, 'O telefone/celular deve ter os 11 digitos'),
        }
      case ADDRESS_INDEX:
        return {
          address: Yup.object().shape({
            cep: Yup.string().required('CEP deve ser preenchido').min(7, 'CEP deve ter pelo menos 7 digitos'),
            address: Yup.string().required('Endereço deve ser preenchido'),
            number: Yup.mixed()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.number().typeError('Número obrigatório').required('Número obrigaório'),
                otherwise: Yup.string()
              }),
            complement: Yup.string(),
            district: Yup.string()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.string().required('Bairro obrigaório'),
                otherwise: Yup.string()
              }),
            city: Yup.string()
              .when('address', {
                is: (val: string) => !!val.length,
                then: Yup.string().required('Cidade obrigaória'),
                otherwise: Yup.string()
              }),
          })
        }
      case CONTACT_INDEX:
        if (!!user.personalInfo && user.userType === 'f')
          return {
            contact: Yup.object().shape({
              phone: Yup.mixed().when('phone', {
                is: (val: string) => val.length > 0,
                then: Yup.string().min(10, 'O telefone/celular deve ter pelo menos 10 digitos'),
                otherwise: Yup.string()
              }),
            })
          }

        return {
          contact: Yup.object().shape({
            phone: Yup.string().min(10, 'O telefone/celular deve ter pelo menos 10 digitos').required(),
            url: Yup.string().url(),
          })
        }
      case SELLER_INDEX:
        return {
          bankInfo: Yup.object().shape({
            bank: Yup.string().min(3, 'O banco deve ter pelo menos 3 digitos').required('Banco obrigatório'),
            name: Yup.string().required('Banco obrigatório'),
            account: Yup.string().min(6, 'A conta deve ter pelo menos 6 digitos').required('Conta obrigatório'),
            agency: Yup.string().min(5, 'A agência deve ter pelo menos 5 digitos').required('Agência obrigatório'),
            pix: Yup.string(),
          })
        }
      case STORE_INDEX:
        return {
          shopInfo: Yup.object().shape({
            name: Yup.string().required('Nome obrigatório'),
          })
        }
    }

    return {};
    // comission: Yup.number().required('Comissão obrigatória').min(0, 'Não pode ser inferior a 0').max(99, 'Máximo de 99%'),
    // category: Yup.string().required('Categoria obrigatória'),

    // address: Yup.string(),
    // number: Yup.mixed()
    //   .when('address', {
    //     is: (val: string) => !!val.length,
    //     then: Yup.number().required('Número obrigaório'),
    //     otherwise: Yup.string()
    //   }),
    // complement: Yup.string(),
    // district: Yup.string()
    //   .when('address', {
    //     is: (val: string) => !!val.length,
    //     then: Yup.string().required('Bairro obrigaório'),
    //     otherwise: Yup.string()
    //   }),
    // city: Yup.string()
    //   .when('address', {
    //     is: (val: string) => !!val.length,
    //     then: Yup.string().required('Cidade obrigaória'),
    //     otherwise: Yup.string()
    //   }),
  }, [flowStep, user]);

  const handleFlowStep = useCallback(() => {
    if (isStepCompleted) {
      setChanged(false);

      setFlowPrevious(flowStep >= 0 ? flowStep : 0);

      if (flowIntent === true && flowStep + 1 <= STORE_INDEX) {
        setFlowStep(flowStep + 1);
      }

      if (flowIntent === false && flowStep > PERSONAL_INDEX) {
        setFlowStep(flowStep - 1);
      }

      if (flowIntent === true && flowStep === STORE_INDEX) {
        router.push('/dashboard');
      }
    }
  }, [flowIntent, flowStep, isStepCompleted]);

  const stepClassName = useCallback((st: number) => {
    if (flowStep === st) {
      if (flowPrevious < flowStep)
        return styles.flowAppearFromRight

      if (flowPrevious > flowStep)
        return styles.flowAppearFromLeft

      if (flowStep === TYPE_INDEX || flowStep === PERSONAL_INDEX)
        return styles.flowAppearFromLeft

      return styles.flow
    }

    return styles.flowUnset
  }, [flowStep, flowPrevious]);

  const handlePersonType = useCallback((personType: string) => {
    console.log(`PersonType: ${personType}`)
    if (personType === 'j') {
      updateUser({
        ...user,
        userType: 'j'
      });
    } else {
      updateUser({
        ...user,
        userType: 'f'
      });
    }

    setFlowStep(flowStep + 1);

    return;
  }, [flowStep])

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setStepCompleted(false);
      setLoading(true);

      console.log(`Intent: ${flowIntent}`)

      try {
        formRef.current?.setErrors({});
        // setStepCompleted(false);

        const schema = Yup.object().shape({ ...yupValidationSchema });
        await schema.validate(data, { abortEarly: false });

        if (!isChanged) {
          setStepCompleted(true);
          setLoading(false);

          handleFlowStep();

          return;
        }

        console.log(`switch - flowStep: ${flowStep}`)
        switch (flowStep) {
          case PERSONAL_INDEX:
            var personalInfo;
            console.log('? - 1')
            if (user.userType === 'f') {
              const {
                firstName,
                lastName,
                cpf,
                birthday } = data.personalInfo as PersonInfo;

              personalInfo = {
                isPF: true,
                firstName,
                lastName,
                cpf,
                birthday, //!!birthday ? format(birthday, 'dd-MM-yyyy') : null,
              };

              console.log('Calling personalInfo')
              await api.post('/account/personalInfo', personalInfo).then(response => {
                const updatedUser = { ...user, ...response.data, userType: !!response.data['isPF'] ? 'f' : 'j' };

                updateUser(updatedUser);
              }).catch(err => {
                console.log(err);
                setStepCompleted(false);
              });

              updateUser({
                ...user,
                personalInfo: {
                  isPF: true,
                  firstName,
                  lastName,
                  cpf,
                  birthday,
                }
              });
            }

            console.log('? - 2')

            const {
              name,
              razaoSocial,
              cnpj,
              inscricaoEstadual,
              inscricaoMunicipal } = data.personalInfo as CompanyInfo;

            personalInfo = {
              isPJ: true,
              name,
              razaoSocial,
              cnpj,
              inscricaoEstadual,
              inscricaoMunicipal
            };

            console.log('Calling personalInfo')
            await api.post('/account/personalInfo', personalInfo).then(response => {
              const updatedUser = { ...user, ...response.data, userType: !!response.data['isPF'] ? 'f' : 'j' };

              updateUser(updatedUser);
              setStepCompleted(true);
            }).catch(err => {
              console.log(err);
            });

            updateUser({
              ...user,
              personalInfo: {
                isPJ: true,
                name,
                razaoSocial,
                cnpj,
                inscricaoEstadual,
                inscricaoMunicipal
              }
            });

            break;
          case ADDRESS_INDEX:
            const {
              cep,
              address,
              city,
              complement,
              district,
              number,
            } = data.address;

            var cepFormatted = cep.replaceAll("-", "");
            cepFormatted = cepFormatted.slice(0, 5) + "-" + cepFormatted.slice(5, cep.length)

            const addressInfo = {
              cep: cepFormatted,
              address,
              city,
              complement,
              district,
              number
            };

            await api.post('/account/address', addressInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
              setStepCompleted(true);
            });

            break;
          case CONTACT_INDEX:
            const {
              phone,
              url,
            } = data.contact;

            const contact = {
              phone,
              url
            }

            await api.post('/account/contact', contact).then(response => {
              updateUser({ ...user, contact: { ...response.data } });
              setStepCompleted(true);
            }).catch(err => {
              console.log(err);
            });

            break;
          case SELLER_INDEX:
            const {
              bank,
              name: bankName,
              account,
              agency,
              pix,
            } = data.bankInfo;

            const bankInfo = {
              bank,
              name: bankName,
              account,
              agency,
              pix
            };

            await api.post('/account/bankInfo', bankInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
              setStepCompleted(true);
            });

            updateUser({ ...user, ...bankInfo })

            break;
          case STORE_INDEX:
            const storeName = data.shopInfo.name;

            const shopInfo = { name: storeName };

            await api.post('/account/shopInfo', shopInfo).then(response => {
              updateUser({ ...user, shopInfo: { ...response.data } });
              setStepCompleted(true);
            });

            // updateUser({ ...user, shopInfo: { ...shopInfo } });

            break;
        }

        setLoading(false);

        handleFlowStep();

        // addToast({
        //   type: 'success',
        //   title: 'Perfil atualizado!',
        //   description:
        //     'Suas informações do perfil foram alteradas com sucesso!',
        // });
      } catch (err) {
        console.log(err)

        setStepCompleted(false);
        setLoading(false);

        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        // addToast({
        //   type: 'error',
        //   title: 'Erro na atualização',
        //   description:
        //     'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
        // });
      }
    },
    [flowStep, flowPrevious, flowIntent, isChanged, isStepCompleted],
  );

  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        // api.patch('/users/avatar', data).then(response => {
        //   updateUser(response.data);

        //   // addToast({
        //   //   type: 'success',
        //   //   title: 'Avatar atualizado!',
        //   // });
        // });
      }
    },
    [updateUser],
  );

  const handleSetBankCode = useCallback((index: number) => {
    if (index >= 0) {
      formRef.current?.setFieldValue('bankInfo.bank', banks[index].code);
      return;
    }

    formRef.current?.setFieldValue('bankInfo.bank', '');
  }, []);

  const handleSetBankName = useCallback((index: number) => {
    if (index >= 0) {
      formRef.current?.setFieldValue('bankInfo.name', banks[index].name);
    }

    formRef.current?.setFieldValue('bankInfo.name', '');
  }, []);

  const handleAdvance = useCallback(() => {
    setFlowIntent(true);
    console.log(`Pré-intent: ${flowIntent}`)
    formRef.current?.submitForm();
  }, [])

  const handleReturn = useCallback(() => {
    setFlowIntent(false);
    console.log(`Pré-intent: ${flowIntent}`)
    formRef.current?.submitForm();
  }, [])

  // useEffect(() => {
  //   formRef.current?.setData({ ...user })
  // }, [formRef, user])

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContent}>
        <Form
          ref={formRef}
          initialData={{
            ...user
          }}
          onSubmit={handleSubmit}
        >
          <div className={styles.controllerContainer}>
            <div className={styles.formsContainer}>
              <div
                className={stepClassName(TYPE_INDEX)}
              >
                <div className={styles.typeButtonsContainer} style={{ height: '100%' }}>
                  <h3>Tipo de cadastro</h3>

                  <div className={styles.buttons}>
                    <UserTypeButton
                      title='Pessoa Física'
                      subtitle='Seu usuário será registrado como uma pessoa física'
                      icon={FaUserTie}
                      onClick={(e) => {
                        console.log('Setting PersonType as f')
                        handlePersonType('f')
                      }}
                    />

                    <UserTypeButton
                      title='Pessoa Jurídica'
                      subtitle='Seu usuário será registrado como uma pessoa jurídica'
                      icon={FaStore}
                      onClick={(e) => {
                        console.log('Setting PersonType as j')
                        handlePersonType('j')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                className={stepClassName(PERSONAL_INDEX)}
              >
                {
                  !!user && user.userType === 'f' ? (
                    <>
                      <h3>Seus dados pessoais</h3>

                      <Scope path={'personalInfo'}>
                        <Input
                          name='firstName'
                          placeholder='Nome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='lastName'
                          placeholder='Sobrenome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='birthday'
                          placeholder='Date de Nascimento'
                          autoComplete='off'
                          isDatePicker
                          onChange={() => {
                            setChanged(true)
                          }}
                          showYearDropdown
                          yearDropdownItemNumber={15}
                          scrollableYearDropdown
                        // defaultValue={!!user?.personalInfo && !!user?.personalInfo.birthday ? user.personalInfo.birthday : ''}
                        />
                      </Scope>

                      <Scope path={'personalInfo'}>
                        <Input
                          name='cpf'
                          placeholder='CPF'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={11}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />
                      </Scope>
                    </>
                  ) : (
                    <>
                      <h3>Seus dados empresariais</h3>

                      <Scope path={'personalInfo'}>
                        <Input
                          name='name'
                          placeholder='Nome'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='razaoSocial'
                          placeholder='Razão social'
                          autoComplete='off'
                          onChange={() => {
                            setChanged(true)
                          }}
                        />

                        <Input
                          name='cnpj'
                          placeholder='CNPJ'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={14}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />

                        <Input
                          name='inscricaoEstadual'
                          placeholder='Inscrição Estadual'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={9}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />

                        <Input
                          name='inscricaoMunicipal'
                          placeholder='Inscrição Municipal'
                          autoComplete='off'
                          // isMasked
                          // mask={'999.999.999-99'}
                          onChange={() => {
                            setChanged(true)
                          }}
                          maxLength={11}
                        // value={!!user?.cpf ? user.cpf : ''}
                        />
                      </Scope>
                    </>
                  )
                }
              </div>

              <div className={stepClassName(CONTACT_INDEX)}>
                <h3>Seus dados de contato</h3>

                <Input
                  name='email'
                  placeholder='E-mail'
                  autoComplete='off'
                  disabled
                />

                <Scope path={'contact'}>
                  <Input
                    name='phone'
                    placeholder='Telefone/celular'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'numer'}
                    maxLength={11}
                  />

                  {!!user && user.userType === 'j' &&
                    <Input
                      name='url'
                      placeholder='URL Site'
                      autoComplete='off'
                    />
                  }
                </Scope>

              </div>

              <Scope path={'address'}>
                <div className={stepClassName(ADDRESS_INDEX)}>
                  <h3>Seu endereço</h3>

                  <Input
                    name='cep'
                    placeholder='CEP'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'numer'}
                    maxLength={8}
                  />

                  <Input
                    name='address'
                    placeholder='Endereço'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  <div className={styles.doubleField}>
                    <Input
                      name='number'
                      placeholder='Número'
                      autoComplete='off'
                      type='number'
                      min={0}
                      onChange={() => {
                        setChanged(true)
                      }}
                    />

                    <Input
                      name='complement'
                      placeholder='Complemento'
                      autoComplete='off'
                      onChange={() => {
                        setChanged(true)
                      }}
                    />
                  </div>

                  <Input
                    name='district'
                    placeholder='Bairro'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  <Input
                    name='city'
                    placeholder='Cidade'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />
                </div>
              </Scope>

              <Scope path={'bankInfo'}>
                <div className={stepClassName(SELLER_INDEX)}>
                  <h3>Seus dados de bancários</h3>

                  <div className={styles.doubleField}>
                    <Autocomplete
                      name='name'
                      placeholder='Banco'
                      items={banks.map(bank => bank.name)}
                      setSelectedItem={handleSetBankCode}
                      autoComplete='off'
                      autoCorrect='off'
                    />

                    <Autocomplete
                      name='bank'
                      placeholder='Código'
                      items={banks.map(bank => bank.code)}
                      setSelectedItem={handleSetBankName}
                      autoComplete='off'
                      type='number'
                    />
                  </div>

                  <Input
                    name='account'
                    placeholder='Conta'
                    autoComplete='off'
                    // isMasked
                    // mask={'99999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={10}
                  />

                  <Input
                    name='agency'
                    placeholder='Agencia'
                    autoComplete='off'
                    // isMasked
                    // mask={'9999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={5}
                  />

                  <Input
                    name='pix'
                    placeholder='PIX'
                    autoComplete='off'
                    // isMasked
                    // mask={'9999-9'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={30}
                  />

                  {/* <Input
                name='commission'
                placeholder='Taxa de Comissão'
                isMasked
                mask={'99'}
              />

              <Input
                name='role'
                placeholder='Categoria'
                autoComplete='off'
              /> */}

                </div>
              </Scope>

              <Scope path='shopInfo'>
                <div className={stepClassName(STORE_INDEX)}>
                  <h3>Os dados da sua loja</h3>

                  <Input
                    name='name'
                    placeholder='Nome'
                    autoComplete='off'
                    onChange={() => {
                      setChanged(true)
                    }}
                  />

                  {/* <Input
                  name='address'
                  placeholder='Endereço'
                  autoComplete='off'
                  />

                  <div className={styles.doubleField}>
                    <Input
                      name='number'
                      placeholder='Número'
                      autoComplete='off'
                      min={0}
                    />

                    <Input
                      name='complement'
                      placeholder='Complemento'
                      autoComplete='off'
                    />
                  </div>

                  <Input
                    name='block'
                    placeholder='Bairro'
                    autoComplete='off'
                  />

                  <Input
                    name='city'
                    placeholder='Cidade'
                    autoComplete='off'
                  /> */}
                </div>
              </Scope>
            </div>
          </div>
          {
            flowStep >= 0 && (
              <div className={styles.buttonsContainer}>
                <Button
                  type="submit"
                  onClick={async (e) => {
                    e.preventDefault();

                    handleReturn()
                    // formRef.current?.submitForm();
                    // handleFlowStep();
                  }}
                  customStyle={{ className: styles.backButton }}
                  disabled={(flowStep === PERSONAL_INDEX || flowStep === -1)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  customStyle={{ className: styles.nextButton }}
                  onClick={async (e) => {
                    e.preventDefault();

                    handleAdvance()
                    // handleFlowStep();
                  }}
                >
                  {(flowStep !== STORE_INDEX) ? 'Avançar' : 'Confirmar'}
                </Button>
              </div>
            )
          }
        </Form>

        {/* <div className={styles.indicatorContainer}>
          <div className={styles.indicator} style={(flowStep === 0 || flowStep === -1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 2) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 3) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
        </div> */}
      </div>
      {
        isLoading && (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        )
      }
    </div >
  );
};

export default Profile;
function moment(birthday: Date, arg1: string): string | number | readonly string[] | undefined {
  throw new Error('Function not implemented.');
}

