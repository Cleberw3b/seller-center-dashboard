import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiBox, FiCalendar, FiCheck, FiClipboard, FiMoreHorizontal, FiSearch, FiX, FiXCircle } from 'react-icons/fi'
import { RiArrowGoBackFill } from 'react-icons/ri'
import { FormHandles } from '@unform/core';
import { GetStaticProps } from 'next';
import { format, isSameWeek, isSameMonth, isToday, parse } from 'date-fns';
import { Form } from '@unform/web';

import Button from '../../components/PrimaryButton';
import FilterButton from '../../components/FilterButton';

import FilterInput from '../../components/FilterInput';
import StatusPanel from '../../components/OrderStatusPanel';

import styles from './styles.module.scss';
import DatePickerPopup from '../../components/DatePickerPopup';
import Collapsible from '../../components/Collapsible';
import HeaderDropdown from 'src/components/HeaderDropdown';
import AttachButton from 'src/components/AttachButton';

enum SellStatus {
  Entregue,
  Processando,
  Retornado,
  Cancelado,
  Faturando,
  Despachando,
  Todos
}

enum OrderStatus {
  Aprovado = 0,
  Processando = 1,
  Cancelado = 2,
  Devolvido = 3,
  Todos = 4
}

enum Filter {
  Hoje = 0,
  Semana = 1,
  Mes = 3,
  Custom = 4
}

type OrderProduct = {
  name: string,
  quantity: number,
  price: number,
  discount: number,
}

export type Sell = {
  id: any,
  order_number: string,
  marketplace: 'VTEX' | 'AMAZON' | 'OZLLO' | 'B2W',
  date: number;
  status: SellStatus, //'Processando' | 'Faturando' | 'Despachando' | 'Retornado' | 'Cancelado' | 'Entregue',
  products: OrderProduct[]
  total: number,
  nfe_url?: string,
  shipment_cod?: string,
}

interface SearchFormData {
  search: string;
}

interface SellsProps {
  sells: Sell[];
}

interface Totals {
  totalApproved: number;
  totalProcessing: number;
  totalCanceled: number;
  totalReturned: number;
  total: number;
}

function InOrderStatus(order: Sell, filter: OrderStatus): boolean {

  switch (filter) {
    case OrderStatus.Aprovado:
      return order.status === SellStatus.Entregue;
    case OrderStatus.Cancelado:
      return order.status === SellStatus.Cancelado;
    case OrderStatus.Devolvido:
      return order.status === SellStatus.Retornado;
    case OrderStatus.Processando:
      return order.status === SellStatus.Processando || order.status === SellStatus.Faturando || order.status === SellStatus.Despachando;
  }

  return true;
}

function OrderContainsProduct(order: Sell, search: string): boolean {
  const contains = order.products.reduce((accumulator: number, product: OrderProduct) => {
    accumulator += product.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
    return accumulator;
  }, 0)

  return !!contains;
}

export function Sells({ sells }: SellsProps) {
  const [items, setItems] = useState([] as Sell[]);
  const [status, setStatus] = useState(SellStatus.Todos as SellStatus);
  const [orderStatus, setOrderStatus] = useState(OrderStatus.Todos as OrderStatus);
  const [fromDateFilter, setFromDateFilter] = useState(new Date());
  const [toDateFilter, setToDateFilter] = useState(new Date());
  const [filter, setFilter] = useState(Filter.Hoje);
  const [search, setSeacrh] = useState('');

  const itemsRef = useMemo(() => Array(items.length).fill(0).map(i => React.createRef<HTMLTableRowElement>()), [items]);
  const collapsibleRefs = useMemo(() => items.length > 2 && Array(items.length).fill(0).map(i => React.createRef<HTMLDivElement>()), [items]);

  const [totalApproved, setTotalApproved] = useState('Carregando...');
  const [totalProcessing, setTotalProcessing] = useState('Carregando...');
  const [totalCanceled, setTotalCanceled] = useState('Carregando...');
  const [totalReturned, setTotalReturned] = useState('Carregando...');
  const [total, setTotal] = useState('Carregando...');

  const inInterval = useCallback((order: Sell) => {
    switch (filter) {
      case Filter.Hoje:
        return isToday(order.date);

      case Filter.Semana:
        return isSameWeek(order.date, new Date());

      case Filter.Mes:
        return isSameMonth(order.date, new Date());

      case Filter.Custom:
        console.log(order.order_number);
        return format(order.date, 'yyyy/MM/dd') <= format(toDateFilter, 'yyyy/MM/dd') && format(order.date, 'yyyy/MM/dd') >= format(fromDateFilter, 'yyyy/MM/dd');

      default:
        return isToday(order.date);
    }
  }, [fromDateFilter, toDateFilter, filter])

  useEffect(() => {
    const totals = sells.reduce((accumulator: Totals, order: Sell) => {
      if (inInterval(order)) {
        switch (order.status) {
          case SellStatus.Entregue:
            accumulator.totalApproved += order.total;
            accumulator.total += order.total;
            break;
          case SellStatus.Processando:
          case SellStatus.Faturando:
          case SellStatus.Despachando:
            accumulator.totalProcessing += order.total;
            accumulator.total += order.total;
            break;
          case SellStatus.Cancelado:
            accumulator.totalCanceled += order.total;
            accumulator.total -= order.total;
            break;
          case SellStatus.Retornado:
            accumulator.totalReturned += order.total;
            accumulator.total -= order.total;
            break;
        }
      }

      return accumulator;
    }, { totalApproved: 0, totalCanceled: 0, totalProcessing: 0, totalReturned: 0, total: 0 });

    setTotalApproved(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalApproved));

    setTotalProcessing(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalProcessing));

    setTotalCanceled(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalCanceled));

    setTotalReturned(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.totalReturned));

    setTotal(new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totals.total));
  }, [orderStatus, fromDateFilter, toDateFilter, filter]);

  const formRef = useRef<FormHandles>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    sells.map(sell => {
      console.log({
        ...sell,
        date: format(sell.date, 'dd/MM/yyyy')
      });
    });

    setItems(sells.filter(sell => {
      if (status === SellStatus.Todos)
        return inInterval(sell) && InOrderStatus(sell, orderStatus) && (search === '' || OrderContainsProduct(sell, search));

      return inInterval(sell) && (sell.status === status) && (search === '' || OrderContainsProduct(sell, search));
    }));
  }, [sells, status, orderStatus, fromDateFilter, toDateFilter, search, filter]);

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

  const handleAttachment = useCallback(async (data: any) => {
    console.log(data);
  }, [items]);

  const datePickerRef = useRef<FormHandles>(null);
  const [datePickerVisibility, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    console.log(`Status: ${status}`);
  }, [status]);

  return (
    <>
      <div className={status !== SellStatus.Todos ? styles.sellsContainer : styles.sellsContainerShorter}>
        <div className={styles.sellsHeader}>
          <HeaderDropdown items={[
            { text: 'Todas', value: SellStatus.Todos },
            { text: 'Aguardando Pagamento', value: SellStatus.Processando },
            { text: 'Aguardando Faturamento', value: SellStatus.Faturando },
            { text: 'Aguardando Despacho', value: SellStatus.Despachando },
            { text: 'Retornados', value: SellStatus.Retornado },
            { text: 'Cancelados', value: SellStatus.Cancelado }
          ]}
            setActiveItem={setStatus} />
          {/* <BulletedButton
            onClick={() => setStatus(SellStatus.Todos)}
            isActive={status === SellStatus.Todos}>
            Todas
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Processando)}
            isActive={status === SellStatus.Processando}>
            Aguardando Pagamento
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Faturando)}
            isActive={status === SellStatus.Faturando}>
            Aguardando Faturamento
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Despachando)}
            isActive={status === SellStatus.Despachando}>
            Aguardando Despacho
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Retornado)}
            isActive={status === SellStatus.Retornado}>
            Retornados
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Cancelado)}
            isActive={status === SellStatus.Cancelado}>
            Cancelados
        </BulletedButton>
          <BulletedButton
            onClick={() => setStatus(SellStatus.Entregue)}
            isActive={status === SellStatus.Entregue}>
            Entregues
        </BulletedButton> */}
        </div>
        <div className={styles.divider} />
        <div className={styles.sellsContent}>
          <div className={styles.sellsOptions}>
            <div className={styles.contentFilters}>
              <FilterButton isActive={filter === Filter.Hoje} onClick={() => setFilter(Filter.Hoje)}>
                Hoje
              </FilterButton>
              <FilterButton isActive={filter === Filter.Semana} onClick={() => setFilter(Filter.Semana)}>
                Esta semana
              </FilterButton>
              <FilterButton isActive={filter === Filter.Mes} onClick={() => setFilter(Filter.Mes)}>
                Este mês
              </FilterButton>
              <div>
                <FilterButton
                  icon={FiCalendar}
                  isActive={filter === Filter.Custom}
                  onClick={() => {
                    setFilter(Filter.Custom);
                    setDatePickerVisibility(!datePickerVisibility);
                  }}>
                  Escolher período
                </FilterButton>

                {filter === Filter.Custom && (
                  <DatePickerPopup
                    formRef={datePickerRef}
                    setToDateFilter={setToDateFilter}
                    setFromDateFilter={setFromDateFilter}
                    style={{
                      // marginBottom: '-13.25rem',
                      marginTop: '-3rem',
                      marginLeft: '-11rem'
                    }}
                    className={styles.datePopupContainer}
                    visibility={datePickerVisibility}
                    setVisibility={setDatePickerVisibility}
                  />
                )}
              </div>
              <Form ref={formRef} onSubmit={handleSubmit} className={styles.searchContainer}>
                <FilterInput
                  name="search"
                  icon={FiSearch}
                  placeholder="Pesquise um produto..."
                  autoComplete="off" />
              </Form>
            </div>
          </div>
          {items.length > 0 ? (
            <div>
              {items.map((item, i) => (
                <div className={styles.itemCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.start}>
                      <FiClipboard />
                      Pedido: <b>{item.order_number}</b>
                    </span>
                    <span className={styles.end}>
                      <FiCalendar />
                      {format(item.date, 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className={styles.cardDivider} />
                  <div className={styles.cardBody}>
                    <div className={styles.products}>
                      <span style={{ marginBottom: '0.5rem' }}><b>Produtos</b></span>
                      {
                        item.products.map((product, i) => {
                          return (i < 2 && <p key={i}>{product.name}</p>)
                        })
                      }
                      {
                        item.products.length > 2 && (
                          <>
                            <Collapsible totalItems={item.products.length} toggleRef={!!collapsibleRefs ? collapsibleRefs[i] : undefined}>
                              {
                                item.products.map((product, i) => {
                                  if (i < 2)
                                    return (<></>)

                                  return (
                                    <p key={i}>{product.name}</p>
                                  )
                                })
                              }
                            </Collapsible>
                          </>
                        )
                      }
                    </div>
                    {
                      item.status === SellStatus.Entregue && (
                        <div className={styles.approvedItem}>
                          <FiCheck />
                            Entregue
                        </div>
                      )
                    }
                    {
                      item.status === SellStatus.Processando && (
                        <div className={styles.processingItem}>
                          <FiMoreHorizontal />
                            Proceesando
                        </div>
                      )
                    }
                    {
                      item.status === SellStatus.Faturando && (
                        <div className={styles.processingItem}>
                          <FiMoreHorizontal />
                            Faturando
                        </div>
                      )
                    }
                    {
                      item.status === SellStatus.Despachando && (
                        <div className={styles.processingItem}>
                          <FiMoreHorizontal />
                            Despachando
                        </div>
                      )
                    }
                    {
                      item.status === SellStatus.Cancelado && (
                        <div className={styles.canceledItem}>
                          <FiX />
                            Cancelado
                        </div>
                      )
                    }
                    {
                      item.status === SellStatus.Retornado && (
                        <div className={styles.returnedItem}>
                          <RiArrowGoBackFill />
                            Retornado
                        </div>
                      )
                    }
                  </div>
                  <div className={styles.cardDivider} />
                  <div className={styles.cardFooter}>
                    <span>Valor: {
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }
                      ).format(item.total)
                    }
                    </span>

                    {status === SellStatus.Faturando ?
                      <AttachButton
                        name={item.id}
                        title='Anexo de NF-e'
                        attachedText='NF-e Anexada'
                        unattachedText='Anexar NF-e'
                        placeholder='Informe a URL da NF-e'
                        handleAttachment={handleAttachment}
                        isAttached={!!item.nfe_url}
                      />
                      :
                      status === SellStatus.Despachando ?
                        <AttachButton
                          name={item.id}
                          title='Código de envio'
                          attachedText='Código de Envio'
                          unattachedText='Informar código'
                          placeholder='Informe o código de envio'
                          handleAttachment={handleAttachment}
                          isAttached={!!item.nfe_url}
                        />
                        :
                        <Button customStyle={{ className: styles.detailsButton }}>
                          Ver detalhes
                        </Button>
                    }
                  </div>
                </div>
              )
              )
              }
            </div>
          ) : (
            <span className={styles.emptyList}> Nenhum item foi encontrado </span>
          )}
        </div>
        {status === SellStatus.Todos && (
          <div className={styles.sellsFooter}>
            <div className={styles.orderStatusButtons}>
              <StatusPanel title='Todos' onClick={() => setOrderStatus(OrderStatus.Todos)} isActive={orderStatus === OrderStatus.Todos}>
                <span className={styles.grayText}> {total} </span>
              </StatusPanel>
              <StatusPanel title='Aprovados' onClick={() => setOrderStatus(OrderStatus.Aprovado)} isActive={orderStatus === OrderStatus.Aprovado}>
                <span className={styles.greenText}> {totalApproved} </span>
              </StatusPanel>
              <StatusPanel title='Processando' onClick={() => setOrderStatus(OrderStatus.Processando)} isActive={orderStatus === OrderStatus.Processando}>
                <span className={styles.blueText}> {totalProcessing} </span>
              </StatusPanel>
              <StatusPanel title='Cancelados' onClick={() => setOrderStatus(OrderStatus.Cancelado)} isActive={orderStatus === OrderStatus.Cancelado}>
                <span className={styles.redText}> {totalCanceled} </span>
              </StatusPanel>
              <StatusPanel title='Devolvidos' onClick={() => setOrderStatus(OrderStatus.Devolvido)} isActive={orderStatus === OrderStatus.Devolvido}>
                <span className={styles.orangeText}> {totalReturned} </span>
              </StatusPanel>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const ordersFromApi: Sell[] = [
  {
    id: '1',
    order_number: '111111111',
    marketplace: 'OZLLO',
    status: SellStatus.Entregue,
    date: parse('01/04/2021', 'dd/MM/yyyy', new Date()).getTime(),
    products: [
      {
        name: 'TRT Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      }
    ],
    total: 599.80,
  },
  {
    id: '2',
    order_number: '222222222',
    marketplace: 'OZLLO',
    status: SellStatus.Faturando,
    products: [
      {
        name: 'RTT Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 2,
      },
      {
        name: 'ZUZ Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'ZUZ Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      },
      {
        name: 'ZUZ Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 1,
      }
    ],
    date: new Date().getTime(),
    total: 899.7,
  },
  {
    id: '3',
    order_number: '4444444444',
    marketplace: 'OZLLO',
    status: SellStatus.Retornado,
    date: parse('13/04/2021', 'dd/MM/yyyy', new Date()).getTime(),
    products: [
      {
        name: 'TRT Molteom Candy Bloomer...',
        price: 299.90,
        discount: 0,
        quantity: 2,
      },
    ],
    total: 599.80,
  },
  {
    id: '4',
    order_number: '5555555555',
    marketplace: 'OZLLO',
    status: SellStatus.Entregue,
    date: new Date().getTime(),
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1,
      }
    ],
    total: 299.90,

  },
  {
    id: '5',
    order_number: '66666666',
    marketplace: 'OZLLO',
    status: SellStatus.Faturando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '6',
    order_number: '77777777',
    marketplace: 'OZLLO',
    status: SellStatus.Faturando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '7',
    order_number: '8888888888',
    marketplace: 'OZLLO',
    status: SellStatus.Despachando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '8',
    order_number: '999999999',
    marketplace: 'OZLLO',
    status: SellStatus.Faturando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '9',
    order_number: '10101010',
    marketplace: 'OZLLO',
    status: SellStatus.Faturando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '10',
    order_number: '1111111111',
    marketplace: 'OZLLO',
    status: SellStatus.Processando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '11',
    order_number: '12121212',
    marketplace: 'OZLLO',
    status: SellStatus.Processando,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
  {
    id: '12',
    order_number: '1313131313',
    marketplace: 'OZLLO',
    status: SellStatus.Cancelado,
    products: [
      {
        name: 'Molteom Candy Bloomer...',
        price: 299.9,
        discount: 0,
        quantity: 1
      }
    ],
    date: new Date().getTime(),
    total: 299.90,

  },
];

export const getStaticProps: GetStaticProps = async ({ }) => {
  const sells = ordersFromApi.sort((a, b) => a.date < b.date ? -1 : 1);

  return ({
    props: { sells },
    revalidate: 10
  })
}

export default Sells;
