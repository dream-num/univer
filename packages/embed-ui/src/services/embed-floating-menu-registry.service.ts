import type { EmbedHostEntry } from '@univerjs/embed';
import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedFloatingMenuContribution } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedFloatingMenuRegistryService {
    private readonly _contributions = new Map<string, EmbedFloatingMenuContribution>();

    register(contribution: EmbedFloatingMenuContribution): IDisposable {
        const key = this._key(contribution.hostType, contribution.entry, contribution.childType);
        if (this._contributions.has(key)) {
            throw new Error(`Embed floating menu contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);

        return toDisposable(() => {
            if (this._contributions.get(key) === contribution) {
                this._contributions.delete(key);
            }
        });
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry, childType?: UniverInstanceType): EmbedFloatingMenuContribution | undefined {
        if (childType != null) {
            const exact = this._contributions.get(this._key(hostType, entry, childType));
            if (exact) {
                return exact;
            }
        }

        return this._contributions.get(this._key(hostType, entry));
    }

    list(): EmbedFloatingMenuContribution[] {
        return [...this._contributions.values()];
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry, childType?: UniverInstanceType): string {
        return childType == null ? `${hostType}:${entry}:*` : `${hostType}:${entry}:${childType}`;
    }
}
