import server from "./server";
import PropTypes from "prop-types";

function Wallet({ keyNum, setKeyNum, keyData, setKeyData }) {
  async function getKeyPair(keyNum) {
    const { data } = await server.get(`keyPair/${keyNum}`);
    setKeyData(data);
  }

  async function onChangeKey(evt) {
    const keyNum = parseInt(evt.target.value, 10);
    setKeyNum(keyNum);
    getKeyPair(keyNum);
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Key Number
        <input
          placeholder="Type a key number, for example: 0"
          type="number"
          min="0"
          max="5"
          value={keyNum}
          onChange={onChangeKey}></input>
      </label>

      <div className="balance">Address: {keyData.address}</div>
      <div className="balance">Balance: {keyData.balance}</div>
    </div>
  );
}
Wallet.propTypes = {
  keyNum: PropTypes.number.isRequired,
  setKeyNum: PropTypes.func.isRequired,
  keyData: PropTypes.object.isRequired,
  setKeyData: PropTypes.func.isRequired,
};

export default Wallet;
