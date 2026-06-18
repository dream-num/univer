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

import type { ICommand } from '@univerjs/core';
import type { EmbedCreateContext, EmbedDescriptor } from '../../types/embed';
import { CommandType, IUndoRedoService } from '@univerjs/core';
import { EmbedCreationService } from '../../services/embed-creation.service';
import { EmbedModelService } from '../../services/embed-model.service';
import { SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from '../mutations/embed-descriptor.mutation';

export type ICreateEmbedCommandParams = EmbedCreateContext;

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

export const CreateEmbedCommand: ICommand<ICreateEmbedCommandParams, EmbedDescriptor | false> = {
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

export const CopyEmbedCommand: ICommand<ICopyEmbedCommandParams, EmbedDescriptor | false> = {
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
