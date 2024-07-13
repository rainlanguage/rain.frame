"use client";

import { ethers, Contract } from 'ethers';
import { useEthersSigner } from './ethersToWagmi';
import { allAbis, orderbokContractAddress, validInputs, validOutputs } from './deployStratButton';

export default function WithdrawButton() {

    const withdrawAmounts = { 
        wflr: 0,
        usdt: 0
    };
    const signer = useEthersSigner()!;
    const orderbookContract = new Contract(orderbokContractAddress, allAbis, signer);

    const withdrawWFLR = async () => {
        const tx = await orderbookContract.withdraw(
            validInputs[0].token,
            validInputs[0].vaultId,
            ethers.utils.parseUnits(withdrawAmounts.wflr.toString(), validInputs[0].decimals)
        );
    }

    const withdrawUSDT = async () => {
        const tx = await orderbookContract.withdraw(
            validOutputs[0].token,
            validOutputs[0].vaultId,
            ethers.utils.parseUnits(withdrawAmounts.usdt.toString(), validOutputs[0].decimals)
        );
    }

    const updateWFLRAmount = (e: any) => {
        withdrawAmounts.wflr = e.target.value
    }

    const updateUSDTAmount = (e: any) => {
        withdrawAmounts.usdt = e.target.value
    }

  return (
    <div>
        <div>
            <button style={{ borderRadius: '10px', padding: '20px' }} onClick={withdrawWFLR}>Withdraw WFLR</button>
            <input type="number" onChange={updateWFLRAmount} />
        </div>
        <div>
            <button style={{ borderRadius: '10px', padding: '20px' }} onClick={withdrawUSDT}>Withdraw eUSDT</button>
            <input type="number" onChange={updateUSDTAmount} />
        </div>
    </div>
  )
}
