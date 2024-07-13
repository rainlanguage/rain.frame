"use client";

import { ethers, Contract } from 'ethers';
import { useEthersSigner } from './ethersToWagmi';
import { allAbis, orderbokContractAddress, validInputs, validOutputs } from './deployStratButton';
import { useState } from 'react';

export default function WithdrawButton() {
    const [wflrValue, setWflrValue] = useState("0");
    const [usdtValue, setUsdtValue] = useState("0");
    
    const signer = useEthersSigner()!;
    const orderbookContract = new Contract(orderbokContractAddress, allAbis, signer);

    const withdrawWFLR = async () => {
        const tx = await orderbookContract.withdraw(
            validInputs[0].token,
            validInputs[0].vaultId,
            ethers.utils.parseUnits(wflrValue, validInputs[0].decimals)
        );
    }

    const withdrawUSDT = async () => {
        const tx = await orderbookContract.withdraw(
            validOutputs[0].token,
            validOutputs[0].vaultId,
            ethers.utils.parseUnits(usdtValue, validOutputs[0].decimals)
        );
    }

    const getVaultBalance = async () => {
        const signerAddress = await signer.getAddress();
        const WFLR = await orderbookContract.vaultBalance(
            signerAddress,
            validInputs[0].token,
            validInputs[0].vaultId,
        );
        const USDT = await orderbookContract.vaultBalance(
            signerAddress,
            validOutputs[0].token,
            validOutputs[0].vaultId,
        );
        setWflrValue(ethers.utils.formatUnits(WFLR, validInputs[0].decimals));
        setUsdtValue(ethers.utils.formatUnits(USDT, validOutputs[0].decimals));
    }

    const updateWFLRAmount = (e: any) => {
        setWflrValue((e.target.value))
    }

    const updateUSDTAmount = (e: any) => {
        setUsdtValue((e.target.value))
    }

  return (
    <div>
        <div>
            <button style={{ borderRadius: '10px', padding: '20px' }} onClick={withdrawWFLR}>Withdraw WFLR</button>
            <input type="string" onChange={updateWFLRAmount} value={wflrValue}/>
        </div>
        <div>
            <button style={{ borderRadius: '10px', padding: '20px' }} onClick={withdrawUSDT}>Withdraw eUSDT</button>
            <input type="string" onChange={updateUSDTAmount} value={usdtValue}/>
        </div>
        <div>
            <button style={{ borderRadius: '10px', padding: '20px' }} onClick={getVaultBalance}>Get Vault Balance</button>
        </div>
    </div>
  )
}
