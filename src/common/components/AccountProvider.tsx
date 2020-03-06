import React, {
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { Currency } from '../constants';
import * as accountService from '../services/accountService';
import { Unpacked } from '../typeUtils';

interface AccountContextType {
  exchange(amount: number, options: { from: Currency; to: Currency }): Promise<void>;
  getBalance(currency: Currency): number;
}

type Balances = Unpacked<ReturnType<typeof accountService.fetchBalances>>;

export const AccountContext = React.createContext(undefined as unknown as AccountContextType);

export default function AccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [balances, setBalances] = useState<Balances>();

  useEffect(() => {
    accountService.fetchBalances().then(setBalances);
  }, []);

  async function exchange(amount: number, { from, to }: { from: Currency; to: Currency }) {
    await accountService.exchange(amount, { from, to });
    setBalances(await accountService.fetchBalances());
  }

  function getBalance(currency: Currency) {
    return balances![currency]; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  return (
    <AccountContext.Provider
      value={{
        exchange,
        getBalance,
      }}
    >
      {!!balances && children}
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
