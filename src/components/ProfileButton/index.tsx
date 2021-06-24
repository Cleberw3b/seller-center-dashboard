import React from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/auth';

import styles from './styles.module.scss';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLoading } from 'src/hooks/loading';
import { CompanyInfo, PersonInfo } from 'src/shared/types/personalInfo';

export const ProfileButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isLoading } = useLoading();
  const route = useRouter();

  // console.log(signOut);

  return (
    <div className={!isLoading ? styles.profileContainer : styles.profileContainerDisabled}>
      <div className={styles.info}>
        {!!user && !!user.personalInfo ?
          (user.userType === 'f') ?
            <span> Olá, {user.personalInfo.firstName} </span>
            :
            (user.userType === 'j') &&
            <span> Olá, {user.personalInfo.name} </span>
          :
          !!user && <span style={{ fontSize: '0.75rem' }}> {user.email} </span>}
        {/* {user ? <img src={!user.avatar_url ? 'https://www.projetodraft.com/wp-content/uploads/2019/06/ozllo_logo.jpg' : user.avatar_url} alt={user.name} /> : <FiUser size={52} color='var(--grafite)' />} */}
        {(!!user && !!user.personalInfo) && <FiUser color='var(--grafite)' />}
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
