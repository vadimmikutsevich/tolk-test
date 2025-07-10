import { Address, Cell, Sender, SendMode, beginCell, contractAddress, Contract, ContractProvider } from '@ton/core';

export type TreasureTokenConfig = {};

export function treasureTokenConfigToCell(_: TreasureTokenConfig): Cell {
    return beginCell().storeUint(0, 64).endCell();
}

export class TreasureToken implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TreasureToken(address);
    }

    static createFromConfig(config: TreasureTokenConfig, code: Cell, wc = 0) {
        const data = treasureTokenConfigToCell(config);
        const init = { code, data };
        return new TreasureToken(contractAddress(wc, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getTotalSupply(provider: ContractProvider): Promise<bigint> {
        const res = await provider.get('getTotalSupply', []);
        return res.stack.readBigNumber();
    }

    /* ───────── 3-A. Mint ───────── */
    async sendMint(provider: ContractProvider, via: Sender, opts: { amount: bigint; value: bigint; queryID?: bigint }) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x0000_0001, 32) // тег Mint
                .storeUint(opts.queryID ?? 0n, 64) // queryId
                .storeUint(opts.amount, 64) // amount
                .endCell(),
        });
    }

    /* ───────── 3-B. Upgrade ───────── */
    async sendUpgrade(
        provider: ContractProvider,
        via: Sender,
        opts: { newCode: Cell; value: bigint; queryID?: bigint },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x0000_7fff, 32) // тег Upgrade
                .storeUint(opts.queryID ?? 0n, 64)
                .storeRef(opts.newCode) // сам байткод
                .endCell(),
        });
    }
}
