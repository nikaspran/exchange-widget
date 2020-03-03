import React from 'react';
import styles from './App.module.css';
import ExchangeWidget from './exchangeWidget/ExchangeWidget';
import AccountProvider from './common/components/AccountProvider';
import FlexSpacer from './common/components/FlexSpacer';

function App() {
  return (
    <AccountProvider>
      <div className={styles.app}>
        <FlexSpacer />

        <ExchangeWidget className={styles.exchangeWidget} />

        <FlexSpacer />

        <div className={styles.attributions}>
          Stock icon by Setyo Ari Wibowo from the Noun Project;
          Caret icon by olcay kurtulus from the Noun Project
        </div>
      </div>
    </AccountProvider>
  );
}

export default App;
