/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IMutationInfo } from '@univerjs/core';
import type { EmbedHostEntry, IEmbedCreateContext, IEmbedDescriptor } from '../types/embed';
import {
    ICommandService,
    Inject,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from '../commands/mutations/embed-descriptor.mutation';
import { EmbedCreationService } from './embed-creation.service';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedModelService } from './embed-model.service';

export interface IEmbedHostCreateContext extends Omit<IEmbedCreateContext, 'hostAnchorId'> {
    requestedHostAnchorId?: string;
    hostContext?: Record<string, unknown>;
}

export interface IEmbedHostCopyContext {
    hostUnitId: string;
    sourceEmbedId: string;
    nextEmbedId: string;
    requestedHostAnchorId?: string;
    hostContext?: Record<string, unknown>;
}

export interface IEmbedHostRemoveContext {
    hostUnitId: string;
    embedId: string;
}

interface IEmbedHostContextNormalizeInput {
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    hostContext?: Record<string, unknown>;
}

export class EmbedHostLifecycleService {
    constructor(
        @Inject(EmbedCreationService)
        private readonly _creationService: EmbedCreationService,
        @Inject(EmbedModelService)
        private readonly _modelService: EmbedModelService,
        @IUniverInstanceService
        private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(EmbedHostAdapterRegistryService)
        private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @ICommandService
        private readonly _commandService: ICommandService,
        @IUndoRedoService
        private readonly _undoRedoService: IUndoRedoService
    ) {
        // noop
    }

    createEmbed(context: IEmbedHostCreateContext): IEmbedDescriptor {
        const hostContext = this._normalizeHostContext(context);
        const initialHostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.embedId,
            hostUnitId: context.hostUnitId,
            hostType: context.hostType,
            entry: context.entry,
            requestedAnchorId: context.requestedHostAnchorId,
            hostContext,
        });

        const result = this._creationService.prepareCreateEmbed({
            ...context,
            hostContext,
            hostAnchorId: initialHostAnchorPlan.hostAnchorId,
        });
        const hostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.embedId,
            hostUnitId: context.hostUnitId,
            hostType: context.hostType,
            entry: context.entry,
            requestedAnchorId: result.descriptor.hostAnchorId,
            hostContext,
            descriptor: result.descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.redoMutations,
            this._toSetDescriptorMutation(result.descriptor),
        ];
        const undoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(result.descriptor),
            ...hostAnchorPlan.undoMutations,
        ];

        this._executeAndPushUndoRedo(result.descriptor.hostUnitId, redoMutations, undoMutations);
        const descriptor = this._getDescriptor(result.descriptor.hostUnitId, result.descriptor.embedId);
        this._afterCreateAnchor(descriptor, hostContext);
        return descriptor;
    }

    copyEmbed(context: IEmbedHostCopyContext): IEmbedDescriptor {
        const sourceDescriptor = this._getDescriptor(context.hostUnitId, context.sourceEmbedId);
        const initialHostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.nextEmbedId,
            hostUnitId: context.hostUnitId,
            hostType: sourceDescriptor.hostType,
            entry: sourceDescriptor.entry,
            requestedAnchorId: context.requestedHostAnchorId,
            hostContext: context.hostContext,
        });

        const descriptor = this._creationService.prepareCopyEmbed({
            hostUnitId: context.hostUnitId,
            sourceEmbedId: context.sourceEmbedId,
            nextEmbedId: context.nextEmbedId,
            nextHostAnchorId: initialHostAnchorPlan.hostAnchorId,
        });
        const hostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.nextEmbedId,
            hostUnitId: context.hostUnitId,
            hostType: sourceDescriptor.hostType,
            entry: sourceDescriptor.entry,
            requestedAnchorId: descriptor.hostAnchorId,
            hostContext: context.hostContext,
            descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.redoMutations,
            this._toSetDescriptorMutation(descriptor),
        ];
        const undoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(descriptor),
            ...hostAnchorPlan.undoMutations,
        ];

        this._executeAndPushUndoRedo(descriptor.hostUnitId, redoMutations, undoMutations);
        const copied = this._getDescriptor(descriptor.hostUnitId, descriptor.embedId);
        this._afterCreateAnchor(copied, context.hostContext);
        return copied;
    }

    removeEmbed(context: IEmbedHostRemoveContext): boolean {
        const descriptor = this._modelService.getDescriptor(context.hostUnitId, context.embedId);
        if (!descriptor) {
            return false;
        }

        const hostAnchorPlan = this._hostAdapterRegistry.removeAnchorPlan({
            embedId: descriptor.embedId,
            hostUnitId: descriptor.hostUnitId,
            hostType: descriptor.hostType,
            entry: descriptor.entry,
            hostAnchorId: descriptor.hostAnchorId,
            descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(descriptor),
            ...hostAnchorPlan.redoMutations,
        ];
        const undoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.undoMutations,
            this._toSetDescriptorMutation({
                ...descriptor,
                lifecycle: 'active',
            }),
        ];

        this._executeAndPushUndoRedo(descriptor.hostUnitId, redoMutations, undoMutations);
        this._afterRemoveAnchor(descriptor);

        return true;
    }

    private _executeAndPushUndoRedo(unitId: string, redoMutations: IMutationInfo[], undoMutations: IMutationInfo[]): void {
        const result = sequenceExecute(redoMutations, this._commandService);
        if (!result.result) {
            const failedMutation = redoMutations[result.index];
            const reason = result.error instanceof Error ? result.error.message : String(result.error ?? '');
            throw new Error(`EMBED_HOST_LIFECYCLE_MUTATION_FAILED:${failedMutation?.id ?? result.index}:${reason}`);
        }

        this._undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations,
            redoMutations,
        });
    }

    private _getDescriptor(hostUnitId: string, embedId: string): IEmbedDescriptor {
        const descriptor = this._modelService.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            throw new Error('EMBED_DESCRIPTOR_NOT_FOUND');
        }

        return descriptor;
    }

    private _normalizeHostContext(context: IEmbedHostContextNormalizeInput): Record<string, unknown> | undefined {
        const hostContext = normalizeSheetHostContext(context.hostContext);

        if (context.hostType === UniverInstanceType.UNIVER_SHEET && context.entry === 'sheets-floating-object') {
            if (typeof hostContext?.subUnitId === 'string') {
                return hostContext;
            }

            const subUnitId = getActiveSheetId(this._univerInstanceService, context.hostUnitId);
            return subUnitId ? { ...hostContext, subUnitId } : hostContext;
        }

        if (context.hostType === UniverInstanceType.UNIVER_SLIDE && context.entry === 'slides-floating-object') {
            if (typeof hostContext?.subUnitId === 'string') {
                return hostContext;
            }

            const subUnitId = getActiveSlidePageId(this._univerInstanceService, context.hostUnitId);
            return subUnitId ? { ...hostContext, subUnitId } : hostContext;
        }

        return hostContext;
    }

    private _toSetDescriptorMutation(descriptor: IEmbedDescriptor): IMutationInfo {
        return {
            id: SetEmbedDescriptorMutation.id,
            params: {
                unitId: descriptor.hostUnitId,
                descriptor,
            },
        };
    }

    private _toSoftDeleteDescriptorMutation(descriptor: IEmbedDescriptor): IMutationInfo {
        return {
            id: SoftDeleteEmbedDescriptorMutation.id,
            params: {
                unitId: descriptor.hostUnitId,
                embedId: descriptor.embedId,
            },
        };
    }

    private _afterCreateAnchor(descriptor: IEmbedDescriptor, hostContext?: Record<string, unknown>): void {
        try {
            this._hostAdapterRegistry.afterCreateAnchor({
                embedId: descriptor.embedId,
                hostUnitId: descriptor.hostUnitId,
                hostType: descriptor.hostType,
                entry: descriptor.entry,
                hostAnchorId: descriptor.hostAnchorId,
                hostContext,
                descriptor,
            });
        } catch {
            // Runtime refresh hooks must not invalidate the committed data mutation.
        }
    }

    private _afterRemoveAnchor(descriptor: IEmbedDescriptor): void {
        try {
            this._hostAdapterRegistry.afterRemoveAnchor({
                embedId: descriptor.embedId,
                hostUnitId: descriptor.hostUnitId,
                hostType: descriptor.hostType,
                entry: descriptor.entry,
                hostAnchorId: descriptor.hostAnchorId,
                descriptor,
            });
        } catch {
            // Runtime refresh hooks must not invalidate the committed data mutation.
        }
    }
}

function normalizeSheetHostContext(hostContext?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!hostContext) {
        return undefined;
    }

    const next = { ...hostContext };
    if (typeof next.sheetIndex !== 'number' && typeof next.tabIndex === 'number') {
        next.sheetIndex = next.tabIndex;
    }
    if (typeof next.sheetName !== 'string' && typeof next.name === 'string') {
        next.sheetName = next.name;
    }
    const rect = getRecord(next.rect);
    if (rect) {
        if (typeof next.left !== 'number' && typeof rect.x === 'number') {
            next.left = rect.x;
        }
        if (typeof next.top !== 'number' && typeof rect.y === 'number') {
            next.top = rect.y;
        }
        if (typeof next.width !== 'number' && typeof rect.width === 'number') {
            next.width = rect.width;
        }
        if (typeof next.height !== 'number' && typeof rect.height === 'number') {
            next.height = rect.height;
        }
    }

    return next;
}

function getActiveSheetId(univerInstanceService: IUniverInstanceService, unitId: string): string | undefined {
    const workbook = univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_SHEET) as {
        getActiveSheet?: () => unknown;
    } | undefined;
    const activeSheet = workbook?.getActiveSheet?.() as {
        getSheetId?: () => string;
        getSheetID?: () => string;
        getConfig?: () => { id?: string };
    } | undefined;

    return activeSheet?.getSheetId?.() ?? activeSheet?.getSheetID?.() ?? activeSheet?.getConfig?.().id;
}

function getActiveSlidePageId(univerInstanceService: IUniverInstanceService, unitId: string): string | undefined {
    const slide = univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_SLIDE) as {
        pageManager?: {
            getActiveSlide?: () => unknown;
            getSlides?: () => unknown[];
        };
        getActivePage?: () => unknown;
        getSnapshot?: () => Record<string, unknown>;
    } | undefined;
    const activePage = slide?.pageManager?.getActiveSlide?.() ?? slide?.getActivePage?.();
    const activePageId = getIdFromSlidePage(activePage);
    if (activePageId) {
        return activePageId;
    }

    const snapshot = slide?.getSnapshot?.();
    const activeSlideId = typeof snapshot?.activeSlideId === 'string' ? snapshot.activeSlideId : undefined;
    if (activeSlideId) {
        return activeSlideId;
    }

    const firstOrderedId = getFirstString(snapshot?.slideOrder) ?? getFirstString(getRecord(snapshot?.body)?.pageOrder);
    if (firstOrderedId) {
        return firstOrderedId;
    }

    return slide?.pageManager?.getSlides?.()
        ?.map((item) => getIdFromSlidePage(item))
        .find((item): item is string => typeof item === 'string');
}

function getFirstString(value: unknown): string | undefined {
    return Array.isArray(value) ? value.find((item): item is string => typeof item === 'string') : undefined;
}

function getIdFromSlidePage(page: unknown): string | undefined {
    const pageRecord = getRecord(page);
    if (typeof pageRecord?.id === 'string') {
        return pageRecord.id;
    }
    const getId = typeof pageRecord?.getId === 'function' ? pageRecord.getId : undefined;
    const id = getId?.call(page);
    return typeof id === 'string' ? id : undefined;
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : undefined;
}
