import { toNano } from '@ton/core';
import { TreasureToken } from '../wrappers/TreasureToken';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const treasureToken = provider.open(
        TreasureToken.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TreasureToken'),
        ),
    );

    await treasureToken.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(treasureToken.address);
}
