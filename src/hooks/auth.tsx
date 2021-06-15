import React, { createContext, useCallback, useState, useContext, useMemo } from 'react';
import api from '../services/api';
import jwt_decode from "jwt-decode";

interface ApiToken {
  auth: boolean;
  token: string;
}
interface Token {
  data: User;
}
export interface User {
  email: string,

  personalInfo: {
    firstName: string,
    lastName: string,
    cpf: string,
    rg: string,
    birthday?: string,
  }

  address: {
    address: string,
    number: number,
    complement?: string,
    district: string,
    city: string,
  }

  // phone?: string,

  // commission: number,
  // role: string,

  bankInfo: {
    bank: string,
    account: string,
    agency: string,
  }

  shopInfo: {
    _id?: string,
    name: string,
    cnpj: string,

    // address: string,
    // district: string,
    // city: string,
    // complement: string,
    // number: number,
  }
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  token: string;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
  verifyUser(apiToken: ApiToken): boolean;
  isRegisterCompleted: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('@SellerCenter:token');
      const user = localStorage.getItem('@SellerCenter:user');

      if (token && user) {

        api.defaults.headers.authorization = token;

        const decodedToken = jwt_decode(token) as Token;
        console.log(decodedToken);

        return { token, user: JSON.parse(user) };
      }
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {

    const response = await api.post('auth/login', { login: email, password });

    //const { token, user } = response.data;
    const { token } = response.data;

    const decodedToken = jwt_decode(token) as Token;

    const user = decodedToken.data as User;

    localStorage.setItem('@SellerCenter:token', token);
    localStorage.setItem('@SellerCenter:user', JSON.stringify(user));

    api.defaults.headers.authorization = token;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@SellerCenter:token');
    localStorage.removeItem('@SellerCenter:user');

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@SellerCenter:user', JSON.stringify(user));

      setData({
        token: data.token,
        user: {
          ...data.user,
          ...user,
        },
      });
    },
    [setData, data.token, data.user],
  );

  const verifyUser = useCallback((apiToken: ApiToken): boolean => {
    try {
      const decodedToken = jwt_decode(apiToken.token) as Token;

      const user = decodedToken.data as User;

      localStorage.setItem('@SellerCenter:token', apiToken.token);
      localStorage.setItem('@SellerCenter:user', JSON.stringify(user));

      api.defaults.headers.authorization = apiToken.token;

      setData({ token: apiToken.token, user });

      return true;
    } catch (err) {
      return false;
    }
  }, [])

  const isRegisterCompleted = useMemo(() => {
    if (!!data.user) {
      // return !!data.user.name && !!data.user.cpf && !!data.user.rg
    }

    return true
  }, [data]);

  return (
    <AuthContext.Provider
      value={{ user: data.user, token: data.token, signIn, signOut, updateUser, verifyUser, isRegisterCompleted }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
