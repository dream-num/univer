import type { EmbedHostEntry } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedHostContainerContribution } from '../types/embed-ui';

export class EmbedHostContainerRegistryService {
    private readonly _contributions = new Map<string, EmbedHostContainerContribution>();

    register(contribution: EmbedHostContainerContribution): void {
        const key = this._key(contribution.hostType, contribution.entry);
        if (this._contributions.has(key)) {
            throw new Error(`Embed host container contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry): EmbedHostContainerContribution | undefined {
        return this._contributions.get(this._key(hostType, entry));
    }

    list(): EmbedHostContainerContribution[] {
        return [...this._contributions.values()];
    }

    supports(hostType: UniverInstanceType, entry: EmbedHostEntry, layout: EmbedHostContainerContribution['layout']): boolean {
        const contribution = this.get(hostType, entry);
        if (!contribution) {
            return false;
        }

        return (contribution.supportedLayouts ?? [contribution.layout]).includes(layout);
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry): string {
        return `${hostType}:${entry}`;
    }
}
