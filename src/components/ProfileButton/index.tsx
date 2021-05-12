import React from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/auth';

import styles from './styles.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const ProfileButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const route = useRouter();

  // console.log(signOut);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.info}>
        {user ? <span> Olá, {user.name} </span> : <span> Usuário não encontrado </span>}
        {user ? <img src={!user.avatar_url ? 'https://www.projetodraft.com/wp-content/uploads/2019/06/ozllo_logo.jpg' : user.avatar_url} alt={user.name} /> : <FiUser size={52} color='var(--grafite)' />}
      </div>
      <div className={styles.profileContent}>
        <div className={styles.divider} />
        <ul className={styles.optionsMenu}>
          <Link href="/profile">
            <a className={styles.menuItem}>
              <FiUser />
              <span>Minha conta</span>
            </a>
          </Link>

          <div className={styles.menuItem} onClick={() => { signOut() }}>
            <FiLogOut />
            <span>Sair</span>
          </div>
        </ul>
      </div>
    </div>
  );
}

export default ProfileButton;
