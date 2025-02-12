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
import { CommandType, LocaleService } from '@univerjs/core';
import { IConfirmService, IMessageService } from '@univerjs/ui';
import { MessageType } from '@univerjs/design';

import { IFindReplaceService } from '../../services/find-replace.service';

export const ReplaceCurrentMatchCommand: ICommand = {
    id: 'ui.command.replace-current-match',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const findReplaceService = accessor.get(IFindReplaceService);
        return findReplaceService.replace();
    },
};

const CONFIRM_REPLACE_ALL_ID = 'CONFIRM_REPLACE_ALL';

export const ReplaceAllMatchesCommand: ICommand = {
    id: 'ui.command.replace-all-matches',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const confirmService = accessor.get(IConfirmService);
        const localeService = accessor.get(LocaleService);
        const messageService = accessor.get(IMessageService);

        if (!await confirmService.confirm({
            id: CONFIRM_REPLACE_ALL_ID,
            title: { title: localeService.t('find-replace.replace.confirm.title') },
            cancelText: localeService.t('button.cancel'),
            confirmText: localeService.t('button.confirm'),
        })) {
            return false;
        }

        const findReplaceService = accessor.get(IFindReplaceService);
        const result = await findReplaceService.replaceAll();
        const { success, failure } = result;

        if (failure > 0) {
            if (success === 0) {
                messageService.show({
                    type: MessageType.Error,
                    content: localeService.t('find-replace.replace.all-failure'),
                });
            } else {
                messageService.show({
                    type: MessageType.Warning,
                    content: localeService.t('find-replace.replace.partial-success', `${success}`, `${failure}`),
                });
            }

            return false;
        }

        messageService.show({
            type: MessageType.Success,
            content: localeService.t('find-replace.replace.all-success', `${success}`),
        });

        return true;
    },
};
