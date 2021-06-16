
import Panel from '../../components/Panel';

import { GetStaticProps } from 'next';

import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { MdAttachMoney } from 'react-icons/md';

import PanelItem from '../../components/PanelItem';

import styles from './styles.module.scss';
import { useRouter } from 'next/router';

interface OrderSummary {
  name: string;
  value: string;
}

const Dashboard: React.FC = () => {
  const [approvedOrders, setApprovedOrders] = useState({
    name: 'Aprovados', value: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(0)
  } as OrderSummary);

  const [canceledOrders, setCanceledOrders] = useState({} as OrderSummary);
  const [returnedOredres, setReturnedOrders] = useState({} as OrderSummary);

  const router = useRouter();

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        <Panel
          icon={MdAttachMoney}
          title='Resumo de Vendas'
          description='Confira os status de suas vendas'
          onPanelButtonClick={() => { router.push('/sells') }}>
          <PanelItem title={approvedOrders.name} value={approvedOrders.value} valueColor='green' />
          <PanelItem title='Processando' value='R$ 0,00' valueColor='blue' />
          <PanelItem title='Cancelados' value='R$ 0,00' valueColor='red' />
          <PanelItem title='Devolvidos' value='R$ 0,00' valueColor='orange' />
        </Panel>
        <Panel
          icon={FiSend}
          title='Status dos Envios'
          description='Confira os status e quantidades referentes aos envios'
          onPanelButtonClick={() => { router.push('/sells') }}>
          <PanelItem title='Aguardando confirmação' value='0' valueColor='gray' />
          <PanelItem title='Aguardando despacho' value='0' valueColor='yellow' />
          <PanelItem title='Despachados' value='0' valueColor='blue' />
          <PanelItem title='Entregues' value='0' valueColor='green' />
          <PanelItem title='Retornados' value='0' valueColor='orange' />
          <PanelItem title='Cancelados' value='0' valueColor='red' />
        </Panel>
        {/* <div className={styles.panelShortcuts}>
          <span>Atalhos</span>
          <div className={styles.shortcutsArea}>

          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
