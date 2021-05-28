import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import BulletedButton from '../../../components/BulletedButton';
import Importzone from '../../../components/Importzone';
import MessageModal from '../../../components/MessageModal';

import styles from './styles.module.scss';
import { FiDownloadCloud, FiUploadCloud } from 'react-icons/fi';
import { FaExclamation } from 'react-icons/fa';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';

function Import() {
  const [files, setFiles] = useState<File[]>([]);

  const [isModalVisible, setModalVisibility] = useState(false);

  const [isUploading, setUploading] = useState(false);
  const [successfull, setSuccessfull] = useState(false);
  const [error, setError] = useState(false);

  const formRef = useRef<FormHandles>(null);

  const router = useRouter();

  const { width } = useMemo(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth }
    }

    return {
      width: undefined
    }
  }, [process.browser]);

  const handleFileUpload = useCallback((uploads: File[]) => {
    setFiles(uploads);
  }, [files]);

  const handleImport = useCallback(() => {
    setModalVisibility(true);
    setError(true);
    //Chamada a API
    //cont await


  }, [files, isUploading, successfull, error]);

  return (
    <main className={styles.importContainer}>
      <section className={styles.importHeader}>
        <BulletedButton
          onClick={() => { router.push((!!width && width < 768) ? "/products-mobile" : "/products") }}>
          Meus produtos
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/create') }}>
          Criar novo produto
        </BulletedButton>
        <BulletedButton
          onClick={() => { router.push('/products/import') }}
          isActive>
          Importar ou exportar
        </BulletedButton>
      </section>
      <div className={styles.divider} />
      <section className={styles.importContent}>
        <div className={styles.exportPanel}>
          <FiDownloadCloud />
          <h3>Exportar planilha inicial</h3>
          <p>
            A planilha inicial é um arquivo com todos os campos que você precisa preencher
            para realizar a importação.
          </p>
          <button type='button'>Exportar Planilha</button>
        </div>
        <div className={styles.importPanel}>
          <FiUploadCloud />
          <h3>Importar</h3>
          <p>Solte ou clique na caixa abaixo para realizar o upload</p>
          <p className={styles.smallText}>São aceitas planilhas no formato *.xlsx, *.xls e *.csv com tamanho de até 10MB</p>
          <Form ref={formRef} onSubmit={handleImport}>
            <Importzone name='import' onFileUploaded={handleFileUpload} />
            <button type='submit'>Importar Planilha</button>
          </Form>
        </div>
      </section>
      {
        isModalVisible && (
          <MessageModal handleVisibility={() => setModalVisibility(false)} alterStyle={successfull}>
            <div className={styles.modalContent}>
              {isUploading &&
                (
                  <>
                    <div className={styles.loader} />
                    <p>Importando a lista de produtos...</p>
                  </>
                )}
              {successfull && (
                <>
                  <p>Produtos cadastrado</p>
                  <p>com sucesso!</p>
                </>
              )}
              {error && (
                <>
                  <FaExclamation />
                  <p>Ops, tem algo errado na sua planilha.</p>
                  <p>Revise os dados e faça o upload novamente</p>
                </>
              )}
            </div>
          </MessageModal>
        )
      }
    </main>
  )
}

export default Import;
