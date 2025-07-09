import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
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

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        treasureToken = blockchain.openContract(
            TreasureToken.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code,
            ),
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await treasureToken.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: treasureToken.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and treasureToken are ready to use
    });
});
