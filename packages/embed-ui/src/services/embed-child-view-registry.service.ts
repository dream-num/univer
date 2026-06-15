import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedChildViewContribution } from '../types/embed-ui';

export class EmbedChildViewRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, EmbedChildViewContribution>();

    register(contribution: EmbedChildViewContribution): void {
        if (this._contributions.has(contribution.childType)) {
            throw new Error(`Embed child view contribution already registered: ${contribution.childType}`);
        }

        this._contributions.set(contribution.childType, contribution);
    }

    get(childType: UniverInstanceType): EmbedChildViewContribution | undefined {
        return this._contributions.get(childType);
    }

    list(): EmbedChildViewContribution[] {
        return [...this._contributions.values()];
    }
}
