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

import type { ICommand, ICreateUnitOptions, UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry, IEmbedCreateContext, IEmbedDescriptor, IEmbedSourceMeta } from '../../types/embed';
import { CommandType, generateRandomId, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { toResourceRefUnitType } from '../../common/unit-type';
import { createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService } from '../../services/embed-capability-registry.service';
import { EmbedCreationService } from '../../services/embed-creation.service';
import { EmbedModelService } from '../../services/embed-model.service';
import { EMBED_CHILD_CREATE_OPTIONS } from '../../services/embed-source-resolver.service';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from '../mutations/embed-descriptor.mutation';

export type ICreateEmbedCommandParams = IEmbedCreateContext;

export interface ICopyEmbedCommandParams {
    hostUnitId: string;
    sourceEmbedId: string;
    nextEmbedId: string;
    nextHostAnchorId: string;
}

export interface IRemoveEmbedCommandParams {
    hostUnitId: string;
    embedId: string;
}

export interface IInsertEmbedBySnapshotCommandParams<TSnapshot = unknown> {
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    childType: UniverInstanceType;
    unitSnapshot: TSnapshot;
    embedId?: string;
    childUnitId?: string;
    hostAnchorId?: string;
    hostContext?: Record<string, unknown>;
    sourceMeta?: IEmbedSourceMeta;
    createUnitOptions?: ICreateUnitOptions;
}

export const CreateEmbedCommand: ICommand<ICreateEmbedCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.create',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        const result = await accessor.get(EmbedCreationService).createEmbed(params);
        accessor.get(IUndoRedoService).pushUndoRedo({
            unitID: params.hostUnitId,
            undoMutations: [{
                id: SoftDeleteEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    embedId: params.embedId,
                },
            }],
            redoMutations: [{
                id: SetEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    descriptor: result.descriptor,
                },
            }],
        });

        return result.descriptor;
    },
};

export const InsertEmbedBySnapshotCommand: ICommand<IInsertEmbedBySnapshotCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.insert-by-snapshot',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const capability = accessor.get(EmbedCapabilityRegistryService).getCapability({
            hostType: params.hostType,
            childType: params.childType,
            entry: params.entry,
        });
        if (!capability) {
            throw new Error('EMBED_CAPABILITY_NOT_SUPPORTED');
        }

        const instanceService = accessor.get(IUniverInstanceService);
        const childSnapshot = normalizeChildSnapshot(params.unitSnapshot, params.childUnitId);
        const childUnit = instanceService.createUnit(
            params.childType,
            childSnapshot as Partial<unknown>,
            {
                ...EMBED_CHILD_CREATE_OPTIONS,
                ...params.createUnitOptions,
            }
        );
        const childUnitId = childUnit.getUnitId();
        const embedId = params.embedId ?? `embed_${generateRandomId(10)}`;
        const descriptor: IEmbedDescriptor = {
            embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            hostAnchorId: params.hostAnchorId ?? `embed_anchor_${generateRandomId(10)}`,
            entry: params.entry,
            source: {
                kind: 'ref',
                ref: {
                    file: { kind: 'self' },
                    unit: {
                        selector: childUnitId,
                        type: toResourceRefUnitType(params.childType),
                    },
                },
            },
            childUnitId,
            childType: params.childType,
            mode: 'interactive',
            sourceMeta: params.sourceMeta ?? createDefaultEmbedSourceMeta(capability),
        };

        accessor.get(EmbedModelService).addDescriptor(params.hostUnitId, descriptor);
        accessor.get(IUndoRedoService).pushUndoRedo({
            unitID: params.hostUnitId,
            undoMutations: [{
                id: SoftDeleteEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    embedId,
                },
            }],
            redoMutations: [{
                id: SetEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    descriptor,
                },
            }],
        });

        return accessor.get(EmbedModelService).getDescriptor(params.hostUnitId, embedId) ?? false;
    },
};

export const CopyEmbedCommand: ICommand<ICopyEmbedCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.copy',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const descriptor = accessor.get(EmbedCreationService).copyEmbed(params);
        accessor.get(IUndoRedoService).pushUndoRedo({
            unitID: params.hostUnitId,
            undoMutations: [{
                id: SoftDeleteEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    embedId: params.nextEmbedId,
                },
            }],
            redoMutations: [{
                id: SetEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    descriptor,
                },
            }],
        });

        return descriptor;
    },
};

function normalizeChildSnapshot<TSnapshot>(snapshot: TSnapshot, childUnitId?: string): TSnapshot {
    if (!childUnitId || typeof snapshot !== 'object' || snapshot === null || Array.isArray(snapshot)) {
        return snapshot;
    }

    return {
        ...snapshot,
        id: childUnitId,
    };
}

export const RemoveEmbedCommand: ICommand<IRemoveEmbedCommandParams> = {
    id: 'embed.command.remove',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const model = accessor.get(EmbedModelService);
        const descriptor = model.getDescriptor(params.hostUnitId, params.embedId);
        if (!descriptor) {
            return false;
        }

        accessor.get(EmbedCreationService).removeEmbed(params);
        accessor.get(IUndoRedoService).pushUndoRedo({
            unitID: params.hostUnitId,
            undoMutations: [{
                id: SetEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    descriptor: {
                        ...descriptor,
                        lifecycle: 'active',
                    },
                },
            }],
            redoMutations: [{
                id: SoftDeleteEmbedDescriptorMutation.id,
                params: {
                    hostUnitId: params.hostUnitId,
                    embedId: params.embedId,
                },
            }],
        });

        return true;
    },
};
