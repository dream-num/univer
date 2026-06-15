import type { EmbedHostEntry } from '@univerjs/embed';
import type { EmbedDescriptor } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedHostAdapterContribution, EmbedHostAnchorMutationPlan, EmbedHostAnchorRemoveMutationPlan } from '../types/embed-ui';
import { CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID } from '../common/const';

export class EmbedHostAdapterRegistryService {
    private readonly _contributions = new Map<string, EmbedHostAdapterContribution>();

    register(contribution: EmbedHostAdapterContribution): void {
        const key = this._key(contribution.hostType, contribution.entry);
        if (this._contributions.has(key)) {
            throw new Error(`Embed host adapter contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry): EmbedHostAdapterContribution | undefined {
        return this._contributions.get(this._key(hostType, entry));
    }

    list(): EmbedHostAdapterContribution[] {
        return [...this._contributions.values()];
    }

    createAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        requestedAnchorId?: string;
        hostContext?: Record<string, unknown>;
    }): string {
        const contribution = this.get(params.hostType, params.entry);
        return contribution?.createAnchor?.(params) ?? params.requestedAnchorId ?? `${params.embedId}-anchor`;
    }

    createAnchorPlan(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        requestedAnchorId?: string;
        hostContext?: Record<string, unknown>;
        descriptor?: EmbedDescriptor;
    }): EmbedHostAnchorMutationPlan {
        const contribution = this.get(params.hostType, params.entry);
        if (contribution?.createAnchorPlan) {
            return contribution.createAnchorPlan(params);
        }

        const hostAnchorId = params.requestedAnchorId ?? `${params.embedId}-anchor`;
        const mutationParams = {
            embedId: params.embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            entry: params.entry,
            hostAnchorId,
        };

        return {
            hostAnchorId,
            redoMutations: [{ id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
            undoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
        };
    }

    removeAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
    }): void {
        this.get(params.hostType, params.entry)?.removeAnchor?.(params);
    }

    afterCreateAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor: EmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.afterCreateAnchor?.(params);
    }

    afterRemoveAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor?: EmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.afterRemoveAnchor?.(params);
    }

    activateAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor: EmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.activateAnchor?.(params);
    }

    removeAnchorPlan(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        descriptor?: EmbedDescriptor;
    }): EmbedHostAnchorRemoveMutationPlan {
        const contribution = this.get(params.hostType, params.entry);
        if (contribution?.removeAnchorPlan) {
            return contribution.removeAnchorPlan(params);
        }

        const mutationParams = {
            embedId: params.embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            entry: params.entry,
            hostAnchorId: params.hostAnchorId,
        };

        return {
            redoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
            undoMutations: [{ id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
        };
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry): string {
        return `${hostType}:${entry}`;
    }
}
