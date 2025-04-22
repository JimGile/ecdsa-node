import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [keyNum, setKeyNum] = useState();
  const [keyData, setKeyData] = useState({});

  return (
    <div className="app">
      <Wallet
        keyNum={keyNum}
        setKeyNum={setKeyNum}
        keyData={keyData}
        setKeyData={setKeyData}
      />
      <Transfer keyData={keyData} setKeyData={setKeyData} />
    </div>
  );
}

export default App;
