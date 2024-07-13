"use client";

import { ethers, Contract } from 'ethers';
import { useState } from 'react';
import { useEthersSigner } from './ethersToWagmi';

export default function DeployStratButton() {
    const [transactionResponse, setTransactionResponse] = useState(null);

    const encodeMeta = (data:any) => {
        return (
            "0x" +
            BigInt(0xff0a89c674ee7874n).toString(16).toLowerCase() +
            ethers.hexlify(ethers.toUtf8Bytes(data)).split("x")[1]
        );
    };

    const allAbis = [
        // used for getting parser address if not already known
        "function iParser() external view returns (address)", 
    
        // used for parsing rainlang for obv3
        "function parse(bytes calldata data) external view returns (bytes calldata bytecode, uint256[] calldata constants)",

        // orderbook v3 abis for adding order
        "function addOrder(((address token, uint8 decimals, uint256 vaultId)[] validInputs, (address token, uint8 decimals, uint256 vaultId)[] validOutputs, (address deployer, bytes bytecode, uint256[] constants) evaluableConfig, bytes meta) config) returns (bool stateChanged)",
    ];

    const deployerContractAddress = "0xd58583e0C5C00C6DCF0137809EA58E9d55A72d66";
    const orderbokContractAddress = "0xb06202aA3Fe7d85171fB7aA5f17011d17E63f382";

    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/flare");
    const signer = useEthersSigner();
    console.log(signer);
    const deployerContract = new ethers.Contract(deployerContractAddress, allAbis, provider);
    
    const orderbookContract = new Contract(orderbokContractAddress, allAbis, provider) as Contract & {
        addOrder: (config: any) => Promise<any>;
    };

    const rainlang = "using-words-from 0x31A76D8644612e0ABD1aF0D42909Ed57F16F608D 0xCE6ad0ba209e7D3B59Ddb8a63595193C11C3B0aB start-time: block-timestamp(),budget-per-day: 10,budget-per-second: div(budget-per-day 86400),time-elapsed: sub(now() start-time),budget-to-date: mul(time-elapsed budget-per-second),spent-so-far: get(order-hash()),spend-this-time: sub(budget-to-date spent-so-far),flr-usd: ftso-current-price-usd(\"FLR\" 3600),usd-flr: inv(flr-usd),max-output: spend-this-time,io-ratio: mul(0.9 usd-flr),:set(order-hash() add(spent-so-far spend-this-time)); :;";
    const rainlangAsBytes = ethers.toUtf8Bytes(rainlang);

    const deployStrategy = async () => {
    // if not known, you can use the iParser() call to get them from deployerContract
    // // example: parserContractAddress = await deployerContract.iParser();
    const parserContractAddress = await deployerContract.iParser();

    const parserContract = new ethers.Contract(parserContractAddress, allAbis, provider);
    const { constants, bytecode } = await parserContract.parse(rainlangAsBytes);
    const addOrderArgs = {
        validInputs: [{
            token: "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d",
            decimals: "18",
            vaultId: "0xd995a9f40baabce2cdf6d783b2fe31bda4f8efa807703c0e3b0654aa6641874e",
        }],
        validOutputs: [{
            token: "0x96B41289D90444B8adD57e6F265DB5aE8651DF29",
            decimals: "6",
            vaultId: "0x4960001e20a2694253c51fbeba336e502314185d3765c53db84fce6af7224fbc",
        }],
        evaluableConfig: {
            deployer: deployerContractAddress,
            constants,
            bytecode
        },
        meta: encodeMeta(rainlang),
    };

    // deploy the order
    const tx = await orderbookContract.connect(signer).addOrder(addOrderArgs);
    setTransactionResponse(tx);
  }

  return (
    <div>
        <button style={{ borderRadius: '10px', padding: '20px' }} onClick={deployStrategy}>deploy strat</button>
        <div style={{ marginTop: '20px' }}>
            {transactionResponse && (
            <div>
                <h2>Transaction Response</h2>
                <pre>{JSON.stringify(transactionResponse, null, 2)}</pre>
            </div>
            )}
        </div>
    </div>
  )
}
