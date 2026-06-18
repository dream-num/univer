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
import type { EmbedDescriptor } from '@univerjs/embed';
import type { EmbedHostCopyContext, EmbedHostCreateContext, EmbedHostRemoveContext } from '../../services/embed-host-lifecycle.service';
import { CommandType } from '@univerjs/core';
import { EmbedHostLifecycleService } from '../../services/embed-host-lifecycle.service';

export type ICreateHostEmbedCommandParams = EmbedHostCreateContext;
export type ICopyHostEmbedCommandParams = EmbedHostCopyContext;
export type IRemoveHostEmbedCommandParams = EmbedHostRemoveContext;

export const CreateHostEmbedCommand: ICommand<ICreateHostEmbedCommandParams, EmbedDescriptor | false> = {
    id: 'embed-ui.command.create-host-embed',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).createEmbed(params);
    },
};

export const CopyHostEmbedCommand: ICommand<ICopyHostEmbedCommandParams, EmbedDescriptor | false> = {
    id: 'embed-ui.command.copy-host-embed',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).copyEmbed(params);
    },
};

export const RemoveHostEmbedCommand: ICommand<IRemoveHostEmbedCommandParams, boolean> = {
    id: 'embed-ui.command.remove-host-embed',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).removeEmbed(params);
    },
};
