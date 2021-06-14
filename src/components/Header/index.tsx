import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from 'src/hooks/auth';
import MenuButton from '../MenuButton';
import ProfileButton from '../ProfileButton';

import styles from './styles.module.scss';

interface HeaderProps {
  open: boolean;
  setOpen: Function;
}

enum OnPage {
  Dashboard,
  Profile,
  Sells,
  Orders,
  Products,
  NewProduct,
}

export const Header: React.FC<HeaderProps> = ({ open, setOpen }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<React.ReactNode>();

  const { isRegisterCompleted } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/' || router.pathname.includes('dashboard')) {
      setTitle('Bem-vindo(a)');
      setDescription(<span>Essa é a sua área de controle de vendas da Ozllo</span>);
      return;
    }

    if (router.pathname.includes('profile')) {
      setTitle('Perfil');
      setDescription(isRegisterCompleted ? <span>As informações da sua conta Ozllo</span> : <span> Finalize seu cadastro para acessar a plataforma </span>);
      return;
    }

    if (router.pathname.includes('sells')) {
      setTitle('Vendas');
      setDescription(<span>Confira o resumo das suas vendas</span>);
      return;
    }

    if (router.pathname.includes('orders')) {
      setTitle('Pedidos');
      setDescription(<span>Confira o resumo dos seus pedidos</span>);
      return;
    }

    if (router.pathname.includes('create/product')) {
      setTitle('Cadastrar novo Produto')
      setDescription(<span>Preencha <b>todos</b> os campos</span>);
    }

    setTitle('Produtos');
    setDescription(<span>Adicione produtos manualmente ou através de um planilha</span>);
  }, [router])

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        {!open && <MenuButton open={open} setOpen={setOpen} />}
        <nav>
          <h2>{title}</h2>
          {description}

          <ProfileButton />
        </nav>
      </div>
    </header>
  );
}
