import React, { useCallback, useEffect, useMemo, useState } from 'react';

import BulletedButton from '../../../components/BulletedButton';
import Button from '../../../components/PrimaryButton';
import StateButton from '../../../components/StateButton';

import { useRouter } from 'next/router';

import styles from './styles.module.scss';
import { GetStaticProps } from 'next';
import { Nationality } from 'src/shared/types/nationality';
import { Category, SubCategory } from 'src/shared/types/category';

import api from 'src/services/api';
import { useLoading } from 'src/hooks/loading';
import { useAuth } from 'src/hooks/auth';
import { sub_categories } from 'src/shared/consts/category';

interface CategoriesDTO {
  nationalities: Nationality[];
}

export function NewProduct({ nationalities: nationalitiesFromApi }: CategoriesDTO) {

  const [nationality, setNationality] = useState<Nationality>();
  const [category, setCategory] = useState<Category>();
  const [subCategory, setSubCategory] = useState<SubCategory>();

  const [nationalities, setNationalities] = useState([] as Nationality[]);
  const [categories, setCategories] = useState([] as Category[]);
  const [subCategories, setSubCategories] = useState([] as SubCategory[]);

  const { setLoading } = useLoading();

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
    setLoading(true);

    setNationalities(nationalitiesFromApi);

    api.get('/category/all').then(response => {
      setCategories(response.data)

      setLoading(false)
    }).catch(err => {
      console.log(err)

      setLoading(false)

      return []
    })
  }, [])

  useEffect(() => {
    if (!!category) {
      setLoading(true);
      setSubCategories(sub_categories.filter((sc: SubCategory) => sc.categoryCode === category.code))
      setLoading(false);

      // api.get(`/category/${category._id}/subcategory`).then(response => {
      //   setSubCategories(response.data)

      //   setLoading(false)
      // }).catch(err => {

      //   setLoading(false)
      // })
    }
  }, [category])

  const handleNationality = useCallback((n: Nationality) => {
    nationality?.id === n.id ? setNationality(undefined) : setNationality(n)
  }, [nationality])

  const handleCategory = useCallback((c: Category) => {
    category?.code === c.code ? setCategory(undefined) : setCategory(c)
  }, [category])

  const handleSubCategory = useCallback((sc: SubCategory) => {
    subCategory?.code === sc.code ? setSubCategory(undefined) : setSubCategory(sc)
  }, [subCategory]);

  const handleRegisterPage = useCallback(() => {
    router.push({
      pathname: 'create/product',
      query: {
        nationality: nationality?.id,
        category: category?.code,
        subCategory: subCategory?.code
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
                    categories.map((c: Category) => (
                      <StateButton
                        key={c.code}
                        onClick={() => handleCategory(c)}
                        isActive={category?.code === c.code}
                        pointer={(!!width && width >= 768)}
                        borders
                      >
                        {c.value}
                      </StateButton>
                    ))
                  }
                </div>
                {
                  !!category && (
                    <div className={styles.subcategoryContainer}>
                      {
                        (!!subCategories && subCategories.length > 0) && (
                          <div className={styles.subCategories}>
                            {
                              subCategories.map(sc => (
                                <Button
                                  key={sc.code}
                                  onClick={() => handleSubCategory(sc)}
                                  isActive={subCategory?.code === sc.code}
                                  customStyle={{ className: styles.subCategoryButton, activeClassName: styles.subCategoryActiveButton }}
                                >
                                  {sc.value}
                                </Button>
                              ))
                            }
                          </div>
                        )
                      }
                      <Button
                        onClick={handleRegisterPage}
                        customStyle={{ className: styles.createButton }}
                      >
                        Cadastrar Produto
                      </Button>
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

export default NewProduct;

export const getStaticProps: GetStaticProps = async ({ }) => {
  const data: CategoriesDTO = {
    nationalities: [{
      id: '1',
      name: 'Nacional',
    }, {
      id: '2',
      name: 'Internacional',
    }],
  };

  return ({
    props: { ...data },
    revalidate: 10
  })
}
