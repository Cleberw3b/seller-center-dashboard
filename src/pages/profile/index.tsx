import React, { useCallback, useRef, ChangeEvent, useState } from 'react';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import AvatarInput from '../../components/AvatarInput';

type ProfileFormData = {
  name: string,
  lastName: string,
  cpf: string,
  rg: string,
  birthday: Date,

  cep: string,
  address: string,
  number: number,
  complement: string,
  district: string,
  city: string,

  email: string,
  phone: string,

  // commission: number,
  // role: string,

  bank: string,
  account: string,
  agency: string,

  store: {
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

const Profile: React.FC = () => {
  const [flowStep, setFlowStep] = useState(0);
  const formRef = useRef<FormHandles>(null);

  const { user, updateUser, isRegisterCompleted } = useAuth();

  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        console.log(data)

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          lastName: Yup.string().required('Sobrenome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          phone: Yup.string().required('Celular obrigatório').min(11, 'O celular deve ter os 11 digitos'),
          cpf: Yup.string().required('CPF obrigatório').min(11, 'O CPF deve ter 11 digitos'),
          rg: Yup.string().required('RG obrigatório').min(9, 'RG deve ter 9 digitos'),
          birthday: Yup.date(),
          cep: Yup.string().required('CEP deve ser preenchido').min(8, 'CEP deve ter 8 digitos'),
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
          bank: Yup.string().min(3, 'O banco deve ter pelo menos 3 digitos').required('Banco obrigatório'),
          account: Yup.string().min(6, 'A conta deve ter pelo menos 6 digitos').required('Conta obrigatório'),
          agency: Yup.string().min(5, 'A agência deve ter pelo menos 5 digitos').required('Agência obrigatório'),
          // comission: Yup.number().required('Comissão obrigatória').min(0, 'Não pode ser inferior a 0').max(99, 'Máximo de 99%'),
          // category: Yup.string().required('Categoria obrigatória'),
          store: Yup.object().shape({
            cnpj: Yup.string().required('CNPJ obrigatório').min(11, 'O CPF deve ter 11 digitos'),
            name: Yup.string().required('Nome obrigatório'),
            // address: Yup.string(),
            // number: Yup.mixed()
            //   .when('address', {
            //     is: (val: string) => !!val.length,
            //     then: Yup.number().required('Número obrigaório'),
            //     otherwise: Yup.string()
            //   }),
            // complement: Yup.string(),
            // block: Yup.string()
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
          })
        });
        await schema.validate(data, { abortEarly: false });

        const {
          name,
          lastName,
          cpf,
          rg,
          birthday,
          cep,
          address,
          city,
          complement,
          district,
          number,
          bank,
          account,
          agency
        } = data;

        const personalInfo = {
          userId: user.id,
          firstName: name,
          lastName,
          cpf,
          rg,
          birthday,
        };

        const addressInfo = {
          userId: user.id,
          cep,
          address,
          city,
          complement,
          district,
          number
        };

        const bankInfo = {
          userId: user.id,
          bank,
          account,
          agency
        };

        const personalResponse = await api.post('/account/personalInfo', personalInfo);
        const addressResponse = await api.post('/account/address', addressInfo);
        const bankResponse = await api.post('/account/bankInfo', bankInfo);

        updateUser({ ...personalResponse.data, ...addressResponse.data, ...bankResponse.data });

        // history.push('/dashboard');

        // addToast({
        //   type: 'success',
        //   title: 'Perfil atualizado!',
        //   description:
        //     'Suas informações do perfil foram alteradas com sucesso!',
        // });
      } catch (err) {
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
    [],
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

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContent}>
        {
          !isRegisterCompleted &&
          (
            <h3>Finalize seu cadastro para acessar a plataforma</h3>
          )
        }
        <Form
          ref={formRef}
          initialData={{
            name: user?.name,
            email: user?.email,
          }}
          onSubmit={handleSubmit}
        >
          {/* <div className={styles.avatarInput}>
            {
              !!user ?
                <AvatarInput avatarUrl={user.avatar_url} userName={user.name} handleAvatarChange={handleAvatarChange} />
                :
                <AvatarInput avatarUrl={''} userName={''} handleAvatarChange={handleAvatarChange} />
            }
          </div> */}

          <div className={styles.formsContainer}>
            <div className={styles.personal} style={{ opacity: 1 }}>
              <h3>Seus dados pessoais</h3>

              <Input
                name='name'
                placeholder='Nome'
                autoComplete='off'
              />

              <Input
                name='lastName'
                placeholder='Sobrenome'
                autoComplete='off'
              />

              <Input
                name='birthday'
                placeholder='Date de Nascimento'
                autoComplete='off'
                isDatePicker
              />

              <Input
                name='email'
                placeholder='E-mail'
                autoComplete='off'
                disabled
              />

              <Input
                name='phone'
                placeholder='Celular'
                autoComplete='off'
                isMasked
                mask={'(99) 99999-9999'}
              />

              <Input
                name='cpf'
                placeholder='CPF'
                autoComplete='off'
                isMasked
                mask={'999.999.999/99'}
              />

              <Input
                name='rg'
                placeholder='RG'
                autoComplete='off'
                isMasked
                mask={'99.999.999-9'}
              />
            </div>
            <div className={styles.seller}>
              <h3>Seus dados de vendedor</h3>

              <Input
                name='bank'
                placeholder='Banco'
                autoComplete='off'
                isMasked
                mask={'999'}
              />

              <Input
                name='account'
                placeholder='Conta'
                autoComplete='off'
                isMasked
                mask={'99999-9'}
              />

              <Input
                name='agency'
                placeholder='Agencia'
                autoComplete='off'
                isMasked
                mask={'9999-9'}
              />

              <Input
                name='cep'
                placeholder='CEP'
                autoComplete='off'
                isMasked
                mask={'99999-999'}
              />

              <Input
                name='address'
                placeholder='Endereço'
                autoComplete='off'
              />

              <div className={styles.doubleField}>
                <Input
                  name='number'
                  placeholder='Número'
                  autoComplete='off'
                  type='number'
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
            <Scope path='store'>
              <div className={styles.store}>
                <h3>Os dados da sua loja</h3>

                <Input
                  name='name'
                  placeholder='Nome'
                  autoComplete='off'
                />

                <Input
                  name='cnpj'
                  placeholder='CNPJ'
                  autoComplete='off'
                  isMasked
                  mask={'99.999.999.9999-99'}
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

          <Button type="submit" customStyle={{ className: styles.saveButton }}>Salvar</Button>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
