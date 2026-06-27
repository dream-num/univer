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
import type { IEmbedHostCopyContext, IEmbedHostCreateContext, IEmbedHostRemoveContext } from '../../services/embed-host-lifecycle.service';
import type { EmbedHostEntry, IEmbedDescriptor, IEmbedSourceMeta } from '../../types/embed';
import { CommandType } from '@univerjs/core';
import { EmbedHostLifecycleService } from '../../services/embed-host-lifecycle.service';

export type ICreateEmbedCommandParams = IEmbedHostCreateContext;
export type ICopyEmbedCommandParams = IEmbedHostCopyContext;
export type IRemoveEmbedCommandParams = IEmbedHostRemoveContext;

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

        return accessor.get(EmbedHostLifecycleService).createEmbed(params);
    },
};

export const InsertEmbedBySnapshotCommand: ICommand<IInsertEmbedBySnapshotCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.insert-by-snapshot',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).createEmbedBySnapshot(params);
    },
};

export const CopyEmbedCommand: ICommand<ICopyEmbedCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.copy',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).copyEmbed(params);
    },
};

export const RemoveEmbedCommand: ICommand<IRemoveEmbedCommandParams> = {
    id: 'embed.command.remove',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).removeEmbed(params);
    },
};
