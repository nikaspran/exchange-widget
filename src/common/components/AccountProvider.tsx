import React, { useContext, ReactNode, useState } from 'react';
import { CURRENCIES, Currency } from '../constants';

interface AccountContextType {
  getBalance(currency: Currency): number;
}

export const AccountContext = React.createContext(undefined as unknown as AccountContextType);

export default function AccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [balances, setBalances] = useState({
    [CURRENCIES.EUR]: 500.95,
    [CURRENCIES.GBP]: 1.11,
    [CURRENCIES.USD]: 200,
  });

  return (
    <AccountContext.Provider
      value={{
        getBalance(currency: Currency) {
          return balances[currency];
        },
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  const account = useContext(AccountContext);
  if (!account) {
    throw new Error('Missing <AccountProvider />, please add it to the component hierarchy');
  }

  return account;
}
