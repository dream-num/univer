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

import type { DocumentDataModel, IAccessor, ICommand } from '@univerjs/core';
import type { LocaleKey } from '../locale/types';
import type { IInsertTableOfContentsDialogProps, IInsertTableOfContentsDialogValue } from '../views/InsertTableOfContentsDialog';
import type { ITableOfContentsDialogProps } from '../views/TableOfContentsDialog';
import {
    CommandType,
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { countTableOfContentsHeadings, findTableOfContentsAtOffset, InsertTableOfContentsCommand, UpdateTableOfContentsCommand } from '@univerjs/docs-toc';
import { IMessageService } from '@univerjs/ui';
import { INSERT_TABLE_OF_CONTENTS_DIALOG_COMPONENT } from '../views/InsertTableOfContentsDialog';
import { TABLE_OF_CONTENTS_DIALOG_COMPONENT } from '../views/TableOfContentsDialog';

const TABLE_OF_CONTENTS_DIALOG_ID = 'doc.dialog.update-table-of-contents';
const INSERT_TABLE_OF_CONTENTS_DIALOG_ID = 'doc.dialog.insert-table-of-contents';

export interface IInsertTableOfContentsOperationParams {
    mode: 'automatic' | 'custom';
}

const DEFAULT_INSERT_VALUE: IInsertTableOfContentsDialogValue = {
    levels: 3,
    showPageNumbers: true,
    rightAlignPageNumbers: true,
    tabLeader: 'dots',
    format: 'fromTemplate',
};

function showNoHeadingsMessage(accessor: IAccessor): void {
    accessor.get(IMessageService).show({
        type: MessageType.Warning,
        content: accessor.get(LocaleService).t<LocaleKey>('docs-toc-ui.tableOfContents.noHeadings'),
    });
}

async function insertTableOfContents(accessor: IAccessor, value: IInsertTableOfContentsDialogValue, title?: string): Promise<boolean> {
    const doc = accessor.get(IUniverInstanceService)
        .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    if (!doc || countTableOfContentsHeadings(doc.getBody(), value.levels) === 0) {
        showNoHeadingsMessage(accessor);
        return false;
    }
    return Boolean(await accessor.get(ICommandService).executeCommand(InsertTableOfContentsCommand.id, {
        unitId: doc.getUnitId(),
        ...value,
        title,
    }));
}

export const InsertTableOfContentsOperation: ICommand<IInsertTableOfContentsOperationParams> = {
    id: 'doc.operation.insert-table-of-contents',
    type: CommandType.OPERATION,
    async handler(accessor, params) {
        if (params?.mode === 'automatic') {
            const title = accessor.get(LocaleService).t<LocaleKey>('docs-toc-ui.tableOfContents.contentsTitle');
            return insertTableOfContents(accessor, DEFAULT_INSERT_VALUE, title);
        }
        if (params?.mode !== 'custom') {
            return false;
        }
        const doc = accessor.get(IUniverInstanceService)
            .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!doc) {
            return false;
        }
        const confirmService = accessor.get(IConfirmService);
        const localeService = accessor.get(LocaleService);
        const state: Pick<IInsertTableOfContentsDialogProps, 'options'> = { options: { ...DEFAULT_INSERT_VALUE } };
        await confirmService.open({
            id: INSERT_TABLE_OF_CONTENTS_DIALOG_ID,
            width: 520,
            title: { title: localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.customTitle') },
            children: {
                label: {
                    name: INSERT_TABLE_OF_CONTENTS_DIALOG_COMPONENT,
                    props: {
                        options: state.options,
                        onChange: (value: IInsertTableOfContentsDialogValue) => {
                            state.options = value;
                        },
                    },
                },
            },
            onConfirm: async () => {
                const inserted = await insertTableOfContents(accessor, state.options);
                if (inserted) {
                    confirmService.close(INSERT_TABLE_OF_CONTENTS_DIALOG_ID);
                }
            },
            onClose: () => confirmService.close(INSERT_TABLE_OF_CONTENTS_DIALOG_ID),
        });
        return true;
    },
};

export const OpenTableOfContentsDialogOperation: ICommand = {
    id: 'doc.operation.open-table-of-contents-dialog',
    type: CommandType.OPERATION,
    async handler(accessor: IAccessor) {
        const doc = accessor.get(IUniverInstanceService)
            .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const selection = accessor.get(DocSelectionManagerService).getActiveTextRange();
        const toc = findTableOfContentsAtOffset(doc?.getBody(), selection?.startOffset);
        if (!doc || !toc) {
            return false;
        }

        const confirmService = accessor.get(IConfirmService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const state: Pick<ITableOfContentsDialogProps, 'mode'> = { mode: 'pageNumbersOnly' };
        await confirmService.open({
            id: TABLE_OF_CONTENTS_DIALOG_ID,
            width: 420,
            title: { title: localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.updateTitle') },
            children: {
                label: {
                    name: TABLE_OF_CONTENTS_DIALOG_COMPONENT,
                    props: {
                        mode: state.mode,
                        onModeChange: (mode: ITableOfContentsDialogProps['mode']) => {
                            state.mode = mode;
                        },
                    },
                },
            },
            onConfirm: async () => {
                try {
                    await commandService.executeCommand(UpdateTableOfContentsCommand.id, {
                        unitId: doc.getUnitId(),
                        rangeId: toc.rangeId,
                        mode: state.mode,
                    });
                } finally {
                    confirmService.close(TABLE_OF_CONTENTS_DIALOG_ID);
                }
            },
            onClose: () => confirmService.close(TABLE_OF_CONTENTS_DIALOG_ID),
        });
        return true;
    },
};
