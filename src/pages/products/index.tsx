import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import GetInitialProps from "next";
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { isSameDay, isSameWeek, isSameMonth, parse, format } from 'date-fns';
import { FiSearch, FiCameraOff, FiEdit } from 'react-icons/fi';

import BulletedButton from '../../components/BulletedButton';
import FilterInput from '../../components/FilterInput';

import { useRouter } from 'next/router';

import { Switch } from '@material-ui/core';

import styles from './styles.module.scss';
import switchStyles from './switch-styles.module.scss';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import api from 'src/services/api';
import { useAuth, User } from 'src/hooks/auth';

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

  const { token, user, updateUser } = useAuth();

  useEffect(() => {
    !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  // const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLInputElement>()), [items]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);


    setItems(products.filter(product => {
      return (!!product.name && (search === '' || product.name.toLowerCase().includes(search.toLowerCase())));
    }));

    setLoading(false);
  }, [search, products]);

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

  useEffect(() => {
    console.log(items);
  }, [items])

  return (
    <div className={styles.productsContainer}>
      <div className={styles.productsHeader}>
        <BulletedButton
          onClick={() => { router.push('/products') }}
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
        <div className={styles.tableContainer}>
          {items.length > 0 ? (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Foto</th>
                  <th>Nome do produto</th>
                  <th>Marca</th>
                  <th>SKU</th>
                  <th>Valor</th>
                  <th>Estoque</th>
                  {/* <th>Status</th>
                  <th>Ação</th> */}
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map((item, i) => (
                  <tr className={styles.tableItem} key={item.id}>
                    <td id={styles.imgCell} >
                      {!!item.images ? <img src={item.images[0]} alt={item.name} /> : <FiCameraOff />}
                    </td>
                    <td id={styles.nameCell}>
                      {item.name}
                    </td>
                    <td>
                      {item.brand}
                    </td>
                    <td>
                      {item.sku}
                    </td>
                    <td id={styles.valueCell}>
                      {
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }
                        ).format(item.price)
                      }
                    </td>
                    <td className={item.stock <= 0 ? styles.redText : ''}>
                      {new Intl.NumberFormat('pt-BR').format(item.stock)}
                    </td>
                    {/* <td id={styles.switchCell}>
                      <MuiThemeProvider theme={theme}>
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
                      <span className={styles.switchSubtitle}>{item.status !== ProductStatus.Ativado ? 'Ativado' : 'Desativado'}</span>
                    </td>
                    <td id={styles.editCell}>
                      <div onClick={() => {
                        router.push({
                          pathname: 'products/edit',
                          query: {
                            id: item.id,
                          }
                        })
                      }}>
                        <FiEdit />
                        <span> Editar </span>
                      </div>
                    </td> */}
                  </tr>
                ))
                }
              </tbody>
            </table>
          ) : (
            <span className={styles.emptyList}> Nenhum item foi encontrado </span>
          )}
        </div>
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
