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

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType, ICommandService, LocaleService } from '@univerjs/core';
import { IConfirmService } from '@univerjs/ui';
import { COMPONENT_DOC_CREATE_TABLE_CONFIRM } from '../../views/table/create/component-name';
import { CreateDocTableCommand } from '../commands/table/doc-table-create.command';

const COMPONENT_DOC_CREATE_TABLE_CONFIRM_ID = 'doc.component.create-table-confirm';

export const DocCreateTableOperation: ICommand = {
    id: 'doc.operation.create-table',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const localeService = accessor.get(LocaleService);
        const confirmService = accessor.get(IConfirmService);
        const commandService = accessor.get(ICommandService);

        const tableCreateParams = {
            rowCount: 3,
            colCount: 5,
        };

        const handleRowColChange = (rowCount: number, colCount: number) => {
            tableCreateParams.rowCount = rowCount;
            tableCreateParams.colCount = colCount;
        };

        await confirmService.open({
            id: COMPONENT_DOC_CREATE_TABLE_CONFIRM_ID,
            children: {
                label: {
                    name: COMPONENT_DOC_CREATE_TABLE_CONFIRM,
                    props: {
                        handleRowColChange,
                        tableCreateParams,
                    },
                },
            },
            width: 400,
            title: { title: localeService.t('toolbar.table.insert') },
            onConfirm: () => {
                commandService.executeCommand(CreateDocTableCommand.id, tableCreateParams);
                confirmService.close(COMPONENT_DOC_CREATE_TABLE_CONFIRM_ID);
            },
            onClose: () => {
                confirmService.close(COMPONENT_DOC_CREATE_TABLE_CONFIRM_ID);
            },
        });

        return true;
    },
};
