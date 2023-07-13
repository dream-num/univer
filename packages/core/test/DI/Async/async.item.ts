import { DependencyPair } from '../../../src/DI/DependencyCollection';
import { Inject } from '../../../src/DI/DependencyQuantity';
import { AA, BB, bbI } from './async.base';

export class BBImpl implements BB {
    static counter = 0;

    constructor(@Inject(AA) private readonly aa: AA) {
        BBImpl.counter += 1;
    }

    get key(): string {
        return `${this.aa.key}bb`;
    }

    getConstructedTime(): number {
        return BBImpl.counter;
    }
}

export const BBFactory: DependencyPair<BB> = [
    bbI,
    {
        useFactory: (aa: AA) => ({
            key: `${aa.key}bb2`,
        }),
        deps: [AA],
    },
];

export const BBLoader: DependencyPair<any> = [
    'dead',
    {
        useAsync: () => import('./async.dead').then((module) => module.A),
    },
];

export const BBValue: BB = {
    key: 'bb3',
};
