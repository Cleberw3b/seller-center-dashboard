import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GetStaticProps } from "next";
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

enum ProductStatus {
  Ativado = 0,
  Desativado = 1,
}

type Product = {
  id: string;
  status: ProductStatus;
  name: string;
  brand: string;
  sku: string;
  date: string;
  value: number;
  stock: number;
  image?: string;
}

interface SearchFormData {
  search: string;
}

interface ProductsProps {
  products: Product[];
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

export function Products({ }: ProductsProps) {
  const [items, setItems] = useState([] as Product[]);
  const [search, setSeacrh] = useState('');
  const [loading, setLoading] = useState(false);

  let products: Product[] = [];

  // const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLInputElement>()), [items]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const items = localStorage.getItem('@SellerCenter:items');

    if (!items) {
      localStorage.setItem('@SellerCenter:items', JSON.stringify(productsFromApi));
      products = productsFromApi;
      return;
    }

    products = JSON.parse(items);
  }, [products])

  useEffect(() => {
    setLoading(true);


    setItems(products.filter(product => {
      return (search === '' || product.name.toLowerCase().includes(search.toLowerCase()));
    }));

    setLoading(false);
  }, [search]);


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
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {items.map((item, i) => (
                  <tr className={styles.tableItem} key={item.id}>
                    <td id={styles.imgCell} >
                      {item.image ? <img src={item.image} alt={item.name} /> : <FiCameraOff />}
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
                    <td id={styles.dateCell}>
                      {item.date}
                    </td>
                    <td id={styles.valueCell}>
                      {
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }
                        ).format(item.value)
                      }
                    </td>
                    <td className={item.stock <= 0 ? styles.redText : ''}>
                      {item.stock}
                    </td>
                    <td id={styles.switchCell}>
                      <MuiThemeProvider theme={theme}>
                        <Switch
                          checked={item.status === ProductStatus.Ativado}
                          onChange={() => handleAvailability(item.id)}
                          classes={{
                            root: switchStyles.root,
                            thumb: item.status === ProductStatus.Ativado ? switchStyles.thumb : switchStyles.thumbUnchecked,
                            track: item.status === ProductStatus.Ativado ? switchStyles.track : switchStyles.trackUnchecked,
                            checked: switchStyles.checked,
                          }}
                        />
                      </MuiThemeProvider>
                      <span className={styles.switchSubtitle}>{item.status === ProductStatus.Ativado ? 'Ativado' : 'Desativado'}</span>
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
                    </td>
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

export let productsFromApi: Product[] = [
  {
    id: '1',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 23,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '2',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 23,
    image: 'https://images-americanas.b2w.io/produtos/01/00/img/2608684/5/2608684535_1GG.jpg'
  },
  {
    id: '3',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '4',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: format(new Date(), 'dd/MM/yyyy'),
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '5',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '6',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '7',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '8',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '9',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '10',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '11',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '12',
    status: ProductStatus.Ativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '13',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '14',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 0,
    image: ''
  },
  {
    id: '15',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '01/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
  {
    id: '16',
    status: ProductStatus.Desativado,
    name: 'Moletom Candy Bloomer...',
    brand: 'Balenciaga',
    sku: '3333333',
    date: '04/04/2021',
    value: 299.90,
    stock: 23,
    image: ''
  },
]

export const getStaticProps: GetStaticProps = async () => {

  return ({
    props: {
      products: productsFromApi,
    },
    revalidate: 10
  });
}

export default Products;
