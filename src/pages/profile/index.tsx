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

type ProfileFormData = {
  personalInfo: {
    firstName: string,
    lastName: string,
    cpf: string,
    rg: string,
    birthday: Date,
  }

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
    account: string,
    agency: string,
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

const PERSONAL_INDEX = 0;
const ADDRESS_INDEX = 1;
const SELLER_INDEX = 2;
const STORE_INDEX = 3;

const Profile: React.FC = () => {
  const [flowIntent, setFlowIntent] = useState(true);
  const [flowStep, setFlowStep] = useState(-1);
  const [flowPrevious, setFlowPrevious] = useState(0);
  const [isStepCompleted, setStepCompleted] = useState(false);
  const [isChanged, setChanged] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const { user, updateUser, isRegisterCompleted } = useAuth();

  useEffect(() => {
    // console.log(user)
    api.get('/account/detail').then(response => {
      updateUser({ ...user, ...response.data })

      formRef.current?.setData({ ...user, ...response.data });
    }).catch(err => {
      console.log(err)
    });
  }, [])

  const yupValidationSchema = useMemo((): object => {
    switch (flowStep) {
      case -1:
      case PERSONAL_INDEX:
        return {
          personalInfo: Yup.object().shape({
            firstName: Yup.string().required('Nome obrigatório'),
            lastName: Yup.string().required('Sobrenome obrigatório'),
            cpf: Yup.string().required('CPF obrigatório').min(11, 'O CPF deve ter 11 digitos'),
            rg: Yup.string().required('RG obrigatório').min(9, 'RG deve ter 9 digitos'),
            birthday: Yup.date(),
          })

          // phone: Yup.string().required('Celular obrigatório').min(11, 'O celular deve ter os 11 digitos'),
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
      case SELLER_INDEX:
        return {
          bankInfo: Yup.object().shape({
            bank: Yup.string().min(3, 'O banco deve ter pelo menos 3 digitos').required('Banco obrigatório'),
            account: Yup.string().min(6, 'A conta deve ter pelo menos 6 digitos').required('Conta obrigatório'),
            agency: Yup.string().min(5, 'A agência deve ter pelo menos 5 digitos').required('Agência obrigatório'),
          })
        }
      case STORE_INDEX:
        return {
          shopInfo: Yup.object().shape({
            cnpj: Yup.string().required('CNPJ obrigatório').min(11, 'O CPF deve ter 11 digitos'),
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
  }, [flowStep]);

  useEffect(() => {
    console.log(`Flow-Intent: ${flowIntent}`)
  }, [flowIntent])

  const handleFlowStep = useCallback(() => {
    console.log(`Action: ${flowIntent} | Step-Done: ${isStepCompleted} - flowStep(${flowStep}) - flowPrevious(${flowPrevious})`);
    if (isStepCompleted) {
      setChanged(false);

      setFlowPrevious(flowStep >= 0 ? flowStep : 0);

      if (flowIntent === true && flowStep + 1 <= 3) {
        console.log(`Avnc: ${flowStep + 1}`);
        flowStep === -1 ? setFlowStep(1) : setFlowStep(flowStep + 1);
      }

      if (flowIntent === false && flowStep > 0) {
        console.log(`Volt: ${flowStep - 1}`);
        setFlowStep(flowStep - 1);
      }
    }
  }, [flowIntent, flowStep, isStepCompleted]);

  const personalFormClassName = useMemo(() => {
    if (flowStep == -1)
      return styles.flow

    if (flowStep === PERSONAL_INDEX)
      return styles.flowAppearFromLeft

    return styles.flowUnset
  }, [flowStep, flowPrevious]);

  const addressFormClassName = useMemo(() => {
    if (flowStep === ADDRESS_INDEX && flowPrevious < ADDRESS_INDEX)
      return styles.flowAppearFromRight

    if (flowStep === ADDRESS_INDEX && flowPrevious > ADDRESS_INDEX)
      return styles.flowAppearFromLeft

    return styles.flowUnset
  }, [flowStep, flowPrevious]);


  const sellerFormClassName = useMemo(() => {
    if (flowStep === SELLER_INDEX && flowPrevious < SELLER_INDEX)
      return styles.flowAppearFromRight

    if (flowStep === SELLER_INDEX && flowPrevious > SELLER_INDEX)
      return styles.flowAppearFromLeft

    return styles.flowUnset
  }, [flowStep, flowPrevious]);

  const storeFormClassName = useMemo(() => {
    if (flowStep === STORE_INDEX)
      return styles.flowAppearFromRight

    return styles.flowUnset
  }, [flowStep, flowPrevious]);

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setStepCompleted(false);

      try {
        formRef.current?.setErrors({});
        // setStepCompleted(false);

        console.log(data)

        const schema = Yup.object().shape({ ...yupValidationSchema });
        await schema.validate(data, { abortEarly: false });

        if (!isChanged) {
          setStepCompleted(true);

          return;
        }

        switch (flowStep) {
          case -1:
          case PERSONAL_INDEX:
            const {
              firstName,
              lastName,
              cpf,
              rg,
              birthday } = data.personalInfo;

            var rgUnmask = rg.replaceAll('.', '');
            rgUnmask = rg.replaceAll('-', '');

            console.log(rg);

            var personalInfo = {
              firstName,
              lastName,
              cpf,
              rg: rgUnmask,
              birthday: format(birthday, 'dd-MM-yyyy'),
            };

            console.log(`Personal: ${personalInfo.toString()}`)

            api.post('/account/personalInfo', personalInfo).then(response => {
              const updatedUser = { ...user, ...response.data };

              console.log(`Updated User: \n${updatedUser.tostring()}`)

              updateUser(updatedUser);
            }).catch(err => {
              console.log(err);
              setStepCompleted(false);
            });

            updateUser({
              ...user,
              personalInfo: {
                firstName,
                lastName,
                cpf,
                rg: rgUnmask,
                birthday: format(birthday, 'dd-MM-yyyy')
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

            api.post('/account/address', addressInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
            });

            updateUser({ ...user, address: { ...addressInfo } });

            break;
          case SELLER_INDEX:
            const {
              bank,
              account,
              agency,
            } = data.bankInfo;

            const bankInfo = {
              bank,
              account,
              agency
            };

            api.post('/account/bankInfo', bankInfo).then(response => {
              updateUser({ ...user, address: { ...response.data } });
            });

            updateUser({ ...user, ...bankInfo })

            break;
          case STORE_INDEX:
            const storeName = data.shopInfo.name;
            const cnpj = data.shopInfo.cnpj;

            const shopInfo = { name: storeName, cnpj: cnpjValidator.format(cnpj) };

            api.post('/account/shopInfo', shopInfo).then(response => {
              console.log("Reponded!")
              updateUser({ ...user, shopInfo: { ...response.data } });
            });

            // updateUser({ ...user, shopInfo: { ...shopInfo } });

            break;
        }

        console.log('Ending?')
        setStepCompleted(true);

        // handleFlowStep();

        // addToast({
        //   type: 'success',
        //   title: 'Perfil atualizado!',
        //   description:
        //     'Suas informações do perfil foram alteradas com sucesso!',
        // });
      } catch (err) {
        console.log(err)

        setStepCompleted(false);

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
    [isChanged, isStepCompleted],
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

  // useEffect(() => {
  //   formRef.current?.setData({ ...user })
  // }, [formRef, user])

  useEffect(() => {
    console.log(`Actual Step: ${flowStep}`)
  }, [flowStep])

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
                className={personalFormClassName}
              >
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
                    defaultValue={!!user?.personalInfo && !!user?.personalInfo.birthday ? user.personalInfo.birthday.toString() : ''}
                  />
                </Scope>

                <Input
                  name='email'
                  placeholder='E-mail'
                  autoComplete='off'
                  disabled
                />

                {/* <Input
                  name='phone'
                  placeholder='Celular'
                  autoComplete='off'
                  isMasked
                  mask={'(99) 99999-9999'}
                  onChange={() => {
                    setChanged(true)
                  }}
                /> */}

                <Scope path={'personalInfo'}>
                  <div className={styles.doubleField}>
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

                    <Input
                      name='rg'
                      placeholder='RG'
                      autoComplete='off'
                      // isMasked
                      // mask={'99.999.999-9'}
                      onChange={() => {
                        setChanged(true)
                      }}
                      maxLength={10}
                    // value={!!user?.rg ? user.rg : ''}
                    />

                  </div>
                </Scope>
              </div>

              <Scope path={'address'}>
                <div className={addressFormClassName}>
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
                <div className={sellerFormClassName}>
                  <h3>Seus dados de bancários</h3>

                  <Input
                    name='bank'
                    placeholder='Banco'
                    autoComplete='off'
                    // isMasked
                    // mask={'999'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={3}
                  />

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
                    maxLength={6}
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
                <div className={storeFormClassName}>
                  <h3>Os dados da sua loja</h3>

                  <Input
                    name='name'
                    placeholder='Nome'
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
                    // mask={'99.999.999.9999-99'}
                    onChange={() => {
                      setChanged(true)
                    }}
                    // type={'number'}
                    maxLength={14}
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
          <div className={styles.buttonsContainer}>
            <Button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                console.log(`step: ${flowStep}`)
                setFlowIntent(false);
                formRef.current?.submitForm();
                handleFlowStep();
              }}
              customStyle={{ className: styles.backButton }}
              disabled={(flowStep === PERSONAL_INDEX || flowStep === -1)}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                console.log(`step: ${flowStep}`)
                setFlowIntent(true);
                formRef.current?.submitForm();

                handleFlowStep();
                // console.log('Done?');
              }}
              customStyle={{ className: styles.nextButton }}
              disabled={(flowStep === STORE_INDEX)}
            >
              Avançar
            </Button>
          </div>
        </Form>

        <div className={styles.indicatorContainer}>
          <div className={styles.indicator} style={(flowStep === 0 || flowStep === -1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 1) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 2) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
          <div className={styles.indicator} style={(flowStep === 3) ? { width: '0.75rem', height: '0.75rem', opacity: 1 } : {}} />
        </div>
      </div>
    </div >
  );
};

export default Profile;
function moment(birthday: Date, arg1: string): string | number | readonly string[] | undefined {
  throw new Error('Function not implemented.');
}

