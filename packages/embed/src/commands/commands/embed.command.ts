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
import type { IEmbedHostCopyContext, IEmbedHostCreateContext, IEmbedHostRemoveContext } from '../../services/embed-host-lifecycle.service';
import type { IEmbedDescriptor } from '../../types/embed';
import { CommandType } from '@univerjs/core';
import { EmbedHostLifecycleService } from '../../services/embed-host-lifecycle.service';

export type ICreateEmbedCommandParams = IEmbedHostCreateContext;
export type ICopyEmbedCommandParams = IEmbedHostCopyContext;
export type IRemoveEmbedCommandParams = IEmbedHostRemoveContext;

export const CreateEmbedCommand: ICommand<ICreateEmbedCommandParams, IEmbedDescriptor | false> = {
    id: 'embed.command.create',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).createEmbed(params);
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
