import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MuiThemeProvider, createMuiTheme, Switch } from '@material-ui/core';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import { FiSearch, FiCameraOff } from 'react-icons/fi';

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
    // !!userFromApi && updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: userFromApi.shopInfo._id } })
  }, [userFromApi])

  const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLInputElement>()), [items]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    api.get('/account/detail').then(response => {
      updateUser({ ...user, shopInfo: { ...user.shopInfo, _id: response.data.shopInfo._id } })
      setLoading(false);
      // return response.data as User;
    }).catch(err => {
      console.log(err)
      setLoading(false);
    });
  }, [])

  useEffect(() => {
    setLoading(true);

    setItems(products.filter(product => {
      return (!!product.name && (search === '' || product.name.toLowerCase().includes(search.toLowerCase())));
    }));

    setLoading(false);
  }, [search, products]);

  useEffect(() => {
    if (!!user) {
      setLoading(true);

      api.get('/product', {
        headers: {
          authorization: token,
          shop_id: user.shopInfo._id,
        }
      }).then(response => {

        console.log(response.data)

        let productsDto = response.data as Product[];

        productsDto = productsDto.map(product => {
          let stockCount: number = 0;

          if (!!product.variations) {
            product.variations.forEach(variation => {
              stockCount = stockCount + Number(variation.stock);
            })
          }

          product.stock = stockCount;

          return product;
        })


        setProducts(productsDto)
        setItems(productsDto)

        setLoading(false);
      }).catch((error) => {
        console.log(error)
        setProducts([]);
        setItems([])

        setLoading(false);
      })
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (data: SearchFormData) => {
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
                  <th>Status</th>
                  {/* <th>Ação</th> */}
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map((item, i) => (
                  <tr className={styles.tableItem} key={i}>
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
                    <td id={styles.switchCell}>
                      <MuiThemeProvider theme={theme}>
                        <Switch
                          inputRef={itemsRef[i]}
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
                    </td>
                    {/* <td id={styles.editCell}>
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
  return ({
    props: {
    },
    revalidate: 10
  });
}

export default Products;
