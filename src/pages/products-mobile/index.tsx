import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { useRouter } from 'next/router';

import { Switch } from '@material-ui/core';

import styles from './styles.module.scss';
import switchStyles from './switch-styles.module.scss';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { useAuth, User } from 'src/hooks/auth';
import api from 'src/services/api';

enum ProductStatus {
  Ativado = 0,
  Desativado = 1,
}

type Variation = {
  size: number | string,
  stock: number,
  color: string,
}

type Product = {
  id: string;
  status: ProductStatus;
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  images?: string[];
  variations: Variation[];
}

interface SearchFormData {
  search: string;
}

interface ProductsProps {
  products: Product[];
}

interface ProductsProps {
  userFromApi: User;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#E2E2E2'
    },
    secondary: {
      main: '#FFFFFF'
    }
  },
});

export function Products({ userFromApi }: ProductsProps) {
  const [products, setProducts] = useState([] as Product[]);
  const [items, setItems] = useState([] as Product[]);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    if (!!user) {
      api.get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {
        // console.log(response.data)

        let productsDto = response.data as Product[];

        productsDto = productsDto.map(product => {
          let stockCount = 0;

          console.log(product);

          if (!!product.variations && Array.isArray(product.variations)) {
            product.variations.forEach(variation => {
              stockCount += variation.stock as number;
            })
          }

          product.stock = stockCount;

          return product;
        })


        setProducts(productsDto)
        setItems(productsDto)
      }).catch((error) => {
        console.log(error)
        setProducts([]);
        setItems([])
      })
    }
  }, [user]);

  useEffect(() => {
    !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  useEffect(() => {
    setLoading(true);


    setItems(products.filter(product => {
      return (search === '' || product.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [search, products]);


  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
      console.log(`Search: ${search} | ${data.search}`)
      try {
        formRef.current?.setErrors({});

        if (data.search !== search) {
          setSeacrh(data.search);
        }

      } catch (err) {
        setError('Ocorreu um erro ao fazer login, cheque as credenciais.');
      }
    },
    [search],
  );

  const handleAvailability = useCallback((id: string) => {
    console.log(id);

    const updatedItems = items.map(i => {
      if (i.id === id)
        return { ...i, status: i.status === ProductStatus.Ativado ? ProductStatus.Desativado : ProductStatus.Ativado };

      return i;
    })

    setItems(updatedItems);

  }, [items]);

  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { router.push('/products-mobile') }}
          isActive>
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/create') }}>
          Criar novo produto
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/import') }}>
          Importar ou exportar
        </BulletedButton>
      </div>
      <div className={styles.divider} />
      <div className={styles.productsContent}>
        <div className={styles.productsOptions}>
          <div className={styles.contentFilters}>
            <Form ref={formRef} onSubmit={handleSubmit}>
              <FilterInput
                name="search"
                icon={FiSearch}
                placeholder="Pesquise um produto..."
                autoComplete="off" />
            </Form>
          </div>
        </div>
        {items.length > 0 ? (
          items.map((item, i) => (
            <div className={styles.itemCard} key={i}>
              <div className={styles.cardBody}>
                <div className={styles.cardImg}>
                  {!!item.images ? <img src={item.images[0]} alt={item.name} /> : <FiCameraOff />}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div>
                    SKU: <b>{item.sku}</b>
                  </div>
                  <div>
                    Marca: <b>{item.brand}</b>
                  </div>
                  <div className={styles.value}>
                    <span>Valor: {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }
                      ).format(item.price)
                    }</span>
                  </div>
                </div>
                <div className={styles.switchContainer}>
                  {/* <MuiThemeProvider theme={theme}>
                    <Switch
                      checked={item.status !== ProductStatus.Ativado}
                      onChange={() => handleAvailability(item.id)}
                      classes={{
                        root: switchStyles.root,
                        thumb: item.status !== ProductStatus.Ativado ? switchStyles.thumb : switchStyles.thumbUnchecked,
                        track: item.status !== ProductStatus.Ativado ? switchStyles.track : switchStyles.trackUnchecked,
                        checked: switchStyles.checked,
                      }}
                    />
                  </MuiThemeProvider>
                  <span className={styles.switchSubtitle}>{item.status !== ProductStatus.Ativado ? 'Ativado' : 'Desativado'}</span> */}
                  <div className={styles.stockContainer}>
                    <span className={item.stock > 0 ? styles.stock : styles.outStock}>{new Intl.NumberFormat('pt-BR').format(item.stock)}</span>
                    <span>Em estoque</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardDivider} />
              <div className={styles.cardFooter}>
                {/* <div onClick={() => {
                  router.push({
                    pathname: 'products/edit',
                    query: {
                      id: item.id,
                    }
                  })
                }}>
                  <FiEdit />
                  <span> Editar </span>
                </div> */}
              </div>
            </div>
          ))
        ) : (
          <span className={styles.emptyList}> Nenhum item foi encontrado </span>
        )}
      </div>
    </div>
  )
}

export const getInitialProps = async () => {
  const user = api.get('/account/detail').then(response => {
    return response.data as User;
  }).catch(err => {
    console.log(err)
  });

  return ({
    props: {
      userFromApi: user
    },
    revalidate: 10
  });
}

export default Products;
