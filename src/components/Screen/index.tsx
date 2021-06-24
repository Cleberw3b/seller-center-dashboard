import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Menu from '../Menu';
import { Header } from '../Header';

import styles from './styles.module.scss';
import { useAuth } from '../../hooks/auth';
import { useRouter } from 'next/router';
import api from 'src/services/api';
import { isTokenValid } from 'src/utils/util';
import { Loader } from '../Loader';
import { useModalMessage } from 'src/hooks/message';
import MessageModal from '../MessageModal';
import { FiCheck, FiX } from 'react-icons/fi';

const Layout: React.FC = ({ children }) => {
  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight }
    }

    return {
      width: undefined,
      height: undefined,
    }
  }, [process.browser]);

  const [open, setOpen] = useState(true);

  const { user, isRegisterCompleted, signOut, token } = useAuth();
  const { showModalMessage, modalMessage, handleModalMessage } = useModalMessage();

  const router = useRouter();

  const handleModalVisibility = useCallback(() => {
    handleModalMessage(false);
  }, [])

  useEffect(() => {
    setOpen(!!width && width >= 1152)
  }, [width])

  useEffect(() => {
    if (!user) {
      router.push('/');
    }

    if (!isTokenValid(token)) {
      api.get(`auth/token/${token}`).then(response => {
        const { isValid } = response.data;

        if (!isValid) {
          signOut();
          router.push('/');
          return;
        }

      }).catch((error) => {
        signOut();
        router.push('/');
        return;
      })

      return;
    }

    if (!isRegisterCompleted && !router.pathname.includes('profile')) {
      router.push('/profile');
    }
  }, [user, router]);

  return (
    <>
      <Menu open={open} setOpen={setOpen} />
      <div className={open ? styles.openMenu : styles.closedMenu}>
        <Header open={open} setOpen={setOpen} />
        <main className={styles.container}>
          {children}
          {/* {isLoading && ( */}
          {/* )} */}
        </main>
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
        {/* <Footer /> */}
      </div>
      {
        showModalMessage && (
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

export default Layout
