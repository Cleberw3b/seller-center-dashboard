import React, { useEffect, useState } from 'react'

import Footer from '../Footer';
import Menu from '../Menu';
import { Header } from '../Header';

import styles from './styles.module.scss';
import { useAuth } from '../../hooks/auth';
import { useRouter } from 'next/router';

const Layout: React.FC = ({ children }) => {
  const [open, setOpen] = useState(true);

  const { user, isRegisterCompleted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }

    if (!isRegisterCompleted && !router.pathname.includes('profile')) {
      router.push('/profile');
    }
  }, [user, router])


  return (
    <>
      <Menu open={open} setOpen={setOpen} />
      <div className={open ? styles.openMenu : styles.closedMenu}>
        <Header open={open} setOpen={setOpen} />
        <main className={styles.container}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Layout
