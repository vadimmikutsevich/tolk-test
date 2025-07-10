import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, Sender, toNano } from '@ton/core';
import { TreasureToken } from '../wrappers/TreasureToken';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TreasureToken', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TreasureToken');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let treasureToken: SandboxContract<TreasureToken>;
    let admin: Sender;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        treasureToken = blockchain.openContract(
            TreasureToken.createFromConfig(
                {
                    id: 0,
                    totalSupply: 0,
                },
                code,
            ),
        );
        const ADMIN_ADDR = Address.parse('0QDJHy0pTrhEuKPfgPIeRI2biWLvIlcl9HvjB-NKiyPGcOiV');

        admin = blockchain.sender(ADMIN_ADDR);
        deployer = await blockchain.treasury('deployer');

        const deployResult = await treasureToken.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: treasureToken.address,
            deploy: true,
            success: true,
        });
    });

    it('mints 100 tokens', async () => {
        await treasureToken.sendMint(deployer.getSender(), {
            amount: 100n,
            value: toNano('0.05'),
        });

        const supply = await treasureToken.getTotalSupply();
        expect(supply).toBe(100n);
    });

    it('accepts Upgrade from admin', async () => {
        const codeV2 = code;
        const res = await treasureToken.sendUpgrade(admin, {
            newCode: codeV2,
            value: toNano('0.1'),
        });

        expect(res.transactions).toHaveTransaction({
            from: admin.address,
            to: treasureToken.address,
            success: true,
        });
    });

    it('rejects Upgrade from stranger', async () => {
        const stranger = await blockchain.treasury('bob');

        const codeV2 = code;
        const tx = await treasureToken.sendUpgrade(stranger.getSender(), {
            newCode: codeV2,
            value: toNano('0.1'),
        });

        expect(tx.transactions).toHaveTransaction({
            from: stranger.address,
            to: treasureToken.address,
            aborted: true,
            exitCode: 401,
        });
    });
});
