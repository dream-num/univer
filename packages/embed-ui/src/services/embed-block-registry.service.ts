import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedBlockContribution } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedBlockRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, EmbedBlockContribution>();

    register(contribution: EmbedBlockContribution): IDisposable {
        this._contributions.set(contribution.childType, contribution);

        return toDisposable(() => {
            if (this._contributions.get(contribution.childType) === contribution) {
                this._contributions.delete(contribution.childType);
            }
        });
    }

    get(childType: UniverInstanceType): EmbedBlockContribution | undefined {
        return this._contributions.get(childType);
    }

    list(): EmbedBlockContribution[] {
        return [...this._contributions.values()];
    }
}
