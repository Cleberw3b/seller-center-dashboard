import React, { useCallback, useRef, ChangeEvent, useState } from 'react';

import { FormHandles, Scope } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import styles from './styles.module.scss';

import { isEmailValid, isPasswordSecure } from '../../utils/util';
import Input from '../../components/InputLabeless';
import Button from '../../components/PrimaryButton';
import AvatarInput from '../../components/AvatarInput';
import Link from 'next/link';
import { FiCheck, FiChevronLeft, FiX } from 'react-icons/fi';
import MessageModal from '../../components/MessageModal';
import { FaExclamation } from 'react-icons/fa';
import { useRouter } from 'next/router';

type SignUpFormData = {
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
}

const SignUp: React.FC = () => {
  const [isModalVisible, setModalVisibility] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [title, setTitle] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [userAvatar, setUserAvatar] = useState<string>();

  const formRef = useRef<FormHandles>(null);

  const { user, updateUser } = useAuth();

  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        console.log(data)

        const schema = Yup.object().shape({
          // name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido')
            .test(
              'email-validation',
              'Informe um e-mail válido',
              (value) => (
                !!value && isEmailValid(value)
              )),
          password: Yup.string()
            .required('Senha obrigatória')
            .min(8, 'No mínimo 8 digitos')
            .test('password-validation',
              'A senha, além de caracteres minúsculos, deve conter pelo menos um caractere maiúsculo, um número e um caractere especial',
              (value) => (
                !!value && isPasswordSecure(value)
              )),
          password_confirmation: Yup.string()
            .required('Confirme sua senha')
            .oneOf([Yup.ref('password')], 'A confirmação deve ser igual a senha'),
        });
        await schema.validate(data, { abortEarly: false });

        const {
          email,
          password
        } = data;

        await api.post('/auth/create', { email, password });

        setModalVisibility(true);
        setSuccessfull(true);
        setTitle('Cadastro realizado com sucesso!');
        setMessage('Cheque seu e-mail para autenticar sua conta.');

        setTimeout(() => {
          router.push('/');
        }, 10000);

        // history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        setModalVisibility(true);
        setSuccessfull(false);
        setTitle('Oops...');
        setMessage('Ocorreu um erro durante o cadastro, tente novamente em alguns instantes.');
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

  const handleModalVisibility = useCallback(() => {
    setModalVisibility(false);

    if (successfull)
      router.push('/');
  }, [isModalVisible])


  const handleAvatarChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        !!userAvatar && URL.revokeObjectURL(userAvatar);
        setUserAvatar(URL.createObjectURL(e.target.files[0]));
      }
    },
    [userAvatar, updateUser],
  );

  return (
    <div className={styles.signupContainer}>
      <header>
        <div>
          <Link href="/">
            <Button
              type='button'
              customStyle={{ className: styles.backButton }}
              icon={FiChevronLeft}
            >
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className={styles.signupContent}>
        <Form
          ref={formRef}
          initialData={{
            name: user?.name,
            email: user?.email,
          }}
          onSubmit={handleSubmit}
        >
          {/* <div className={styles.avatarInput}>
            <AvatarInput avatarUrl={!!userAvatar ? userAvatar : ''} userName={'Avatar'} handleAvatarChange={handleAvatarChange} />
          </div> */}

          <div className={styles.formsContainer}>
            <div className={styles.personal}>
              <h3>Sua conta Ozllo</h3>

              {/* <Input
                name='name'
                placeholder='Nome'
                autoComplete='off'
              /> */}

              <Input
                name='email'
                placeholder='E-mail'
                autoComplete='off'
              />

              <Input
                name="password"
                type="password"
                placeholder="Senha"
              />

              <Input
                name="password_confirmation"
                type="password"
                placeholder="Confirme a senha"
              />

            </div>
          </div>

          <Button type="submit" customStyle={{ className: styles.saveButton }}>Cadastrar</Button>

        </Form>
      </div>
      {
        isModalVisible && (
          <MessageModal handleVisibility={handleModalVisibility} alterStyle={successfull}>
            <div className={styles.modalContent}>
              {successfull ? <FiCheck style={{ color: 'var(--green-100)' }} /> : <FiX style={{ color: 'var(--red-100)' }} />}
              <p>{title}</p>
              <p>{message}</p>
            </div>
          </MessageModal>
        )
      }
    </div>
  );
};

export default SignUp;
