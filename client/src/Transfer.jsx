import { useState } from "react";
import PropTypes from "prop-types";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

function Transfer({ keyData, setKeyData }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function hashMessage(message) {
    return keccak256(utf8ToBytes(String(message)));
  }

  async function signMessage(msg) {
    const hash = hashMessage(msg)
    const temp =  secp.sign(hash, keyData.privateKey, { recovered: true });
    return temp;
  }  
  
  async function transfer(evt) {
    evt.preventDefault();

    const amt = parseInt(sendAmount);
    if (amt <= 0 || amt > 200) {
      alert("Amount must be between 1 and 200");
      return;
    }
    if (recipient < 0 || recipient > 5) {
      alert("Recipient must be between 0 and 5");
      return;
    }
    if (keyData.balance < amt) {
      alert("Not enough funds!");
      return;
    }
    
    const [sig, recoveryBit] = await signMessage(amt);

    try {
      const {
        data 
      } = await server.post(`sendWithSig`, {
        senderSig: toHex(sig),
        recoveryBit: recoveryBit,
        amount: amt,
        recipientKeyNum: recipient,
      });
      setKeyData(data);
      alert(`Transaction successful!`);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          type="number"
          min="1"
          max="200"
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        />
      </label>

      <label>
        Recipient Key Number
        <input
          placeholder="Type key number of the recipient, for example: 1"
          type="number"
          min="0"
          max="5"
          value={recipient}
          onChange={setValue(setRecipient)}
        />
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

Transfer.propTypes = {
  keyData: PropTypes.object.isRequired,
  setKeyData: PropTypes.func.isRequired,
};

export default Transfer;
