import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticProps } from "next";
import { useRouter } from 'next/router';
import { MuiThemeProvider, createMuiTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';
import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { ProductSummary as Product } from 'src/shared/types/product';

import styles from './styles.module.scss';
import switchStyles from './switch-styles.module.scss';
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

          if (!!product.variations && Array.isArray(product.variations)) {
            product.variations.forEach(variation => {
              stockCount += Number(variation.stock);
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

  const handleAvailability = useCallback(async (id: string) => {
    const index = products.findIndex(product => product._id === id);

    console.log(`Id: ${id}`)

    await api.patch(`/product/${id}`, {
      isActive: !products[index].isActive
    }).then(response => {
      console.log(response.data)
      // products[index].isActive === response.data.isActive;
    }).catch(err => {
      console.log(err)
    })
  }, [items, products]);

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
                  <MuiThemeProvider theme={theme}>
                    <Switch
                      checked={item.isActive}
                      onChange={() => handleAvailability(item._id)}
                      classes={{
                        root: switchStyles.root,
                        thumb: item.isActive ? switchStyles.thumb : switchStyles.thumbUnchecked,
                        track: item.isActive ? switchStyles.track : switchStyles.trackUnchecked,
                        checked: switchStyles.checked,
                      }}
                    />
                  </MuiThemeProvider>
                  <span className={styles.switchSubtitle}>{item.isActive ? 'Ativado' : 'Desativado'}</span>
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
