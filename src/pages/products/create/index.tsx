import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import BulletedButton from '../../../components/BulletedButton';
import Button from '../../../components/PrimaryButton';
import StateButton from '../../../components/StateButton';

import { useRouter } from 'next/router';

import styles from './styles.module.scss';
import { GetStaticProps } from 'next';

enum ProductStatus {
  Ativado = 0,
  Desativado = 1,
}

type Product = {
  id: any,
  images: [
    {
      id: any,
      name: string,
      alt_text: string,
      url: string,
    }
  ],
  name: string,
  description: string,
  brand: string,
  more_info?: string,
  gender: string,
  ean?: string,
  sku: string,
  height?: number,
  width?: number,
  length?: number,
  weight?: number,

  variations: [
    {
      type: 'number' | 'size',
      value: number | string,
      stock: number,
      color: string,
    }
  ],

  nationality: {
    id: any,
    name: string,
  },
  category: Category,
}

type Nationality = {
  id: any,
  name: string
}

type Category = {
  id: any,
  name: string,
  sub_category: SubCategory[]
}

type SubCategory = {
  id: any,
  name: string,
}

interface CategoriesDTO {
  nationalities: Nationality[];
  categories: Category[];
}

export function NewProduct({ nationalities: nationalitiesFromApi, categories: categoriesFromApi }: CategoriesDTO) {

  const [nationality, setNationality] = useState<Nationality>();
  const [category, setCategory] = useState<Category>();
  const [subCategory, setSubCategory] = useState<SubCategory>();

  const [nationalities, setNationalities] = useState([] as Nationality[]);
  const [categories, setCategories] = useState([] as Category[]);

  const router = useRouter();

  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth }
    }

    return {
      width: undefined
    }
  }, [process.browser]);

  useEffect(() => {
    setNationalities(nationalitiesFromApi);
    setCategories(categoriesFromApi);
  }, [])

  const handleNationality = useCallback((n: Nationality) => {
    nationality?.id === n.id ? setNationality(undefined) : setNationality(n)
  }, [nationality])

  const handleCategory = useCallback((c: Category) => {
    category?.id === c.id ? setCategory(undefined) : setCategory(c)
  }, [category])

  const handleSubCategory = useCallback((sc: SubCategory) => {
    subCategory?.id === sc.id ? setSubCategory(undefined) : setSubCategory(sc)
  }, [subCategory]);

  const handleRegisterPage = useCallback(() => {
    console.log({
      nationality,
      category,
      subCategory
    })

    router.push({
      pathname: 'create/product',
      query: {
        nationality: nationality?.id,
        category: category?.id,
        subCategory: subCategory?.id
      }
    })
  }, [nationality, category, subCategory])

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <BulletedButton
          onClick={() => { router.push((!!width && width < 768) ? '/products-mobile' : '/products') }}>
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/new') }}
          isActive
        >
          Criar novo produto
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/import') }}>
          Importar ou exportar
        </BulletedButton>
      </section>
      <div className={styles.divider} />
      <section className={styles.content}>
        <div className={styles.contentHeader}>
          <h4>Suas categorias</h4>
          <Button disabled>Nova categoria</Button>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.nationalityContainer}>
            {
              nationalities.map(n => (
                <StateButton
                  key={n.id}
                  onClick={() => handleNationality(n)}
                  isActive={nationality?.id === n.id}
                  pointer={(!!width && width >= 768)}
                >
                  {n.name}
                </StateButton>
              ))
            }
          </div>
          {
            !!nationality && (
              <div className={styles.categoriesContainer}>
                <div className={styles.categoryContainer}>
                  {
                    categories.map(c => (
                      <StateButton
                        key={c.id}
                        onClick={() => handleCategory(c)}
                        isActive={category?.id === c.id}
                        pointer={(!!width && width >= 768)}
                        borders
                      >
                        {c.name}
                      </StateButton>
                    ))
                  }
                </div>
                {
                  !!category && (
                    <div className={styles.subcategoryContainer}>
                      <div className={styles.subCategories}>
                        {
                          category.sub_category.map(sc => (
                            <Button
                              key={sc.id}
                              onClick={() => handleSubCategory(sc)}
                              isActive={subCategory?.id === sc.id}
                              customStyle={{ className: styles.subCategoryButton, activeClassName: styles.subCategoryActiveButton }}
                            >
                              {sc.name}
                            </Button>
                          ))
                        }
                      </div>
                      {
                        (!!subCategory || category.sub_category.length === 0) && (
                          <Button
                            onClick={handleRegisterPage}
                            customStyle={{ className: styles.createButton }}
                          >
                            Cadastrar Produto
                          </Button>
                        )
                      }
                    </div>
                  )
                }
              </div>
            )
          }
        </div>
      </section>
    </main >
  )
}

const nationalityFromApi: Nationality[] = [
  {
    id: '1',
    name: 'Nacional'
  },
  {
    id: '2',
    name: 'Internacional'
  },
]

const categoriesFromApi: Category[] = [
  {
    id: '1',
    name: 'Acessórios ',
    sub_category: [
      {
        id: '1',
        name: 'Acessórios de Cabelo',
      },
      {
        id: '2',
        name: 'Bolsas',
      },
      {
        id: '3',
        name: 'Chapéus',
      },
      {
        id: '4',
        name: 'Cintos',
      },
      {
        id: '5',
        name: 'Lenços',
      },
      {
        id: '6',
        name: 'Óculos',
      },
      {
        id: '7',
        name: 'Relógios',
      },
      {
        id: '8',
        name: 'Necessaires',
      },
      {
        id: '9',
        name: 'Malas e mochilas',
      },
      {
        id: '10',
        name: 'Eletrônicos',
      },
      {
        id: '11',
        name: 'Bijoux',
      },
    ]
  },
  {
    id: '3',
    name: 'Acessórios ',
    sub_category: [
      {
        id: '1',
        name: 'Acessórios de Cabelo',
      },
      {
        id: '2',
        name: 'Bolsas',
      },
      {
        id: '3',
        name: 'Chapéus',
      },
      {
        id: '4',
        name: 'Cintos',
      },
      {
        id: '5',
        name: 'Lenços',
      },
      {
        id: '6',
        name: 'Óculos',
      },
      {
        id: '7',
        name: 'Relógios',
      },
      {
        id: '8',
        name: 'Necessaires',
      },
      {
        id: '9',
        name: 'Malas e mochilas',
      },
      {
        id: '10',
        name: 'Eletrônicos',
      },
      {
        id: '11',
        name: 'Bijoux',
      },
    ]
  },
  {
    id: '2',
    name: 'Acessórios ',
    sub_category: [
      {
        id: '1',
        name: 'Acessórios de Cabelo',
      },
      {
        id: '2',
        name: 'Bolsas',
      },
      {
        id: '3',
        name: 'Chapéus',
      },
      {
        id: '4',
        name: 'Cintos',
      },
      {
        id: '5',
        name: 'Lenços',
      },
      {
        id: '6',
        name: 'Óculos',
      },
      {
        id: '7',
        name: 'Relógios',
      },
      {
        id: '8',
        name: 'Necessaires',
      },
      {
        id: '9',
        name: 'Malas e mochilas',
      },
      {
        id: '10',
        name: 'Eletrônicos',
      },
      {
        id: '11',
        name: 'Bijoux',
      },
    ]
  },
]

export default NewProduct;

export const getStaticProps: GetStaticProps = async ({ }) => {
  const data: CategoriesDTO = {
    nationalities: nationalityFromApi,
    categories: categoriesFromApi,
  };

  return ({
    props: { ...data },
    revalidate: 10
  })
}
