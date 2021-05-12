import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck, FiX } from 'react-icons/fi';

import { useAuth, User } from '../../hooks/auth';
import api from '../../services/api';

import styles from './styles.module.scss'

const Verify: React.FC = () => {
  const [isVerifying, setVerifying] = useState(true);
  const [isVerified, setVerified] = useState(false);

  const router = useRouter();

  const { verifyUser, user } = useAuth();
  const { token } = router.query;

  useEffect(() => {
    if (token === '') {
      router.push('/');
    }

    api.get(`/auth/activate/${token}`).then((response) => {
      console.log(response.data);

      if (verifyUser(response.data)) {
        setVerifying(false);
        setVerified(true);

        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);

        return;
      }

      setVerifying(false);
      setVerified(false);
    }).catch((err) => {
      setVerifying(false);
      setVerified(false);
    })

  }, [])

  return (
    <div className={styles.container}>
      {
        isVerifying && (
          <div className={styles.verifying}>
            <div className={styles.dotFlashing}></div>
            <p>Estamos confirmando seu e-mail e autenticando o acesso</p>
          </div>
        )
      }
      {
        (isVerified && !isVerifying) && (
          <div className={styles.verified}>
            <FiCheck />
            <h2>Conta verificada!</h2>
            <p>Iremos te redirecionar a página inicial em alguns instantes</p>
          </div>
        )
      }
      {
        (!isVerified && !isVerifying) && (
          <div className={styles.notVerified}>
            <FiX />
            <h2>Conta não verificada!</h2>
            <p>Confira o link de verificação e tente novamente</p>
          </div>
        )
      }
    </div>
  )
}

export default Verify;
