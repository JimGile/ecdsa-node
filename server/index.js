const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const publicKeyToAddress = (publicKey) => {
  const address = publicKey.slice(-20); // last 20 bytes of the public key
  return toHex(address);
}
const generateKeyPair = () => {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey);
  const address = publicKeyToAddress(publicKey);
  return { privateKey: toHex(privateKey), publicKey, address };
}

const keyPairs = [];
for (let i = 0; i < 6; i++) {
  const { privateKey, publicKey, address } = generateKeyPair();
  const blanace = 200 - (i*25); // initial balance of 100 for each address
  keyPairs.push({ privateKey: privateKey, publicKey: publicKey, address: address, balance: blanace });
}

app.get("/keyPair/:keyNum", (req, res) => {
  const { keyNum } = req.params;
  const keyPair = keyPairs[keyNum] || {};
  res.send(keyPair);
});

app.post("/sendWithSig", (req, res) => {
  const { senderSig, recoveryBit, amount, recipientKeyNum } = req.body;
  recoverPublicKey(senderSig, recoveryBit, amount).then((publicKey) => {
    const sender = publicKeyToAddress(publicKey);

    // find the sender in the keyPairs array
    const senderKeyPair = keyPairs.find((keyPair) => keyPair.address === sender);
    if (!senderKeyPair) {
      res.status(400).send({ message: "Sender not found!" });
      return;
    }

    // find the recipient in the keyPairs array
    const recipientKeyPair = keyPairs[recipientKeyNum];
    if (!recipientKeyPair) {
      res.status(400).send({ message: "Recipient not found!" });
      return;
    }

    // check the sender balance
    if (senderKeyPair.balance < amount) {
      res.status(400).send({ message: "Not enough funds!" });
      return;
    }

    // tranfer funds
    senderKeyPair.balance -= amount;
    recipientKeyPair.balance += amount;
    console.log(`Transfer successful. Sender=${senderKeyPair.address}, Recipient=${recipientKeyPair.address}, Amount=${amount}`);
    res.send(senderKeyPair);
  }).catch((err) => {
    console.error(err);
    res.status(400).send({ message: "Invalid signature!" });
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function hashMessage(message) {
  return keccak256(utf8ToBytes(String(message)));
}

async function recoverPublicKey(signature, recoveryBit, message) {
  return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
