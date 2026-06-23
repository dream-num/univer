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

import type { ICommand, ModernDocumentWidthMode, PaperType } from '@univerjs/core';
import type { IConfirmPartMethodOptions } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import type { IDocPageSetupCommandParams } from '../commands/doc-page-setup.command';
import {
    CommandType,
    DocumentFlavor,
    ICommandService,
    IConfirmService,
    LocaleService,
    MODERN_DOCUMENT_WIDTH,
    PAGE_SIZE,
} from '@univerjs/core';
import { PAGE_SETTING_COMPONENT_ID } from '../../views/PageSettings';
import { DocPageSetupCommand } from '../commands/doc-page-setup.command';

export const DocOpenPageSettingCommand: ICommand = {
    id: 'docs.operation.open-page-setting',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const confirmService = accessor.get(IConfirmService) as IConfirmService<IConfirmPartMethodOptions>;
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const disposable = confirmService.open({
            id: PAGE_SETTING_COMPONENT_ID,
            title: {
                label: localeService.t<LocaleKey>('docs-ui.page-settings.document-setting'),
            },
            children: {
                label: PAGE_SETTING_COMPONENT_ID,
            },
            width: 528,
            onClose: () => {
                disposable.dispose();
            },
            onConfirm: (result) => {
                disposable.dispose();
                if (!result) return;

                const paperSize = result.mode === DocumentFlavor.MODERN
                    ? {
                        width: MODERN_DOCUMENT_WIDTH[result.modernWidth as ModernDocumentWidthMode],
                        height: PAGE_SIZE.A4.height,
                    }
                    : PAGE_SIZE[result.paperSize as PaperType];

                commandService.executeCommand(DocPageSetupCommand.id, {
                    documentFlavor: result.mode,
                    pageOrient: result.orientation,
                    marginTop: result.margins.top,
                    marginBottom: result.margins.bottom,
                    marginLeft: result.margins.left,
                    marginRight: result.margins.right,
                    pageSize: paperSize,
                } as IDocPageSetupCommandParams);
            },
            confirmText: localeService.t<LocaleKey>('docs-ui.page-settings.confirm'),
            cancelText: localeService.t<LocaleKey>('docs-ui.page-settings.cancel'),
        });

        return true;
    },
};
