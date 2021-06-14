import { NextPageContext } from 'next'
import { AppProps, AppContext } from 'next/app'
import Router from "next/router"
import api from '../services/api'

import '../../public/styles/theme.scss'

import { AuthProvider, useAuth } from '../hooks/auth'

import Layout from '../components/Screen'
import SignUp from './signup'
import SignIn from './index'
import Verify from './verify/[token]'

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
      { Component === SignIn || Component === SignUp || Component === Verify ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}

    </AuthProvider>
  )
}

MyApp.getInitialProps = async (props: AppContext) => {

  const { Component, ctx }: AppContext = props
  const { req, res }: NextPageContext = ctx

  let pageProps: any = {}
  if (Component.getInitialProps)
    pageProps = await Component.getInitialProps(ctx)

  return { pageProps }
}

export default MyApp
