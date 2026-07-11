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

import type { LocaleKey } from '../../locale/types';
import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { Button, Input } from '@univerjs/design';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import {
    getExistingNamesSet,
    SetSheetTableCommand,
    TableManager,
    validateSheetTableName,
} from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useMemo, useState } from 'react';

export interface ISheetTableRenameDialogProps {
    unitId: string;
    tableId: string;
    onClose: () => void;
}

export function SheetTableRenameDialog(props: ISheetTableRenameDialogProps) {
    const { unitId, tableId, onClose } = props;
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const tableManager = useDependency<TableManager>(TableManager);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const definedNamesService = useDependency<IDefinedNamesService>(IDefinedNamesService);
    const table = tableManager.getTableById(unitId, tableId);
    const [value, setValue] = useState(table?.getDisplayName() ?? '');
    const [error, setError] = useState('');

    const existingNames = useMemo(() => {
        const names = getExistingNamesSet(unitId, {
            univerInstanceService,
            tableManager,
            definedNamesService,
        });
        const currentName = table?.getDisplayName().toLowerCase();

        if (currentName) {
            names.delete(currentName);
        }

        return names;
    }, [definedNamesService, table, tableManager, unitId, univerInstanceService]);

    const handleConfirm = () => {
        const nextName = value.trim();
        if (!table || nextName === table.getDisplayName()) {
            onClose();
            return;
        }

        const validation = validateSheetTableName(nextName, existingNames);
        if (!validation.valid) {
            setError(localeService.t<LocaleKey>('sheets-table-ui.tableNameError'));
            return;
        }

        commandService.executeCommand(SetSheetTableCommand.id, {
            unitId,
            tableId,
            name: nextName,
        });
        onClose();
    };

    return (
        <div
            className={`
              univer-box-border univer-flex univer-w-full univer-flex-col univer-gap-4 univer-pb-3 univer-pt-2
            `}
        >
            <Input
                size="middle"
                value={value}
                placeholder={localeService.t<LocaleKey>('sheets-table-ui.renamePlaceholder')}
                onChange={(nextValue) => {
                    setValue(nextValue);
                    setError('');
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        handleConfirm();
                    }
                }}
                autoFocus
            />
            {error ? <div className="-univer-mt-2 univer-text-sm univer-text-red-500">{error}</div> : null}
            <div className="univer-flex univer-w-full univer-items-center univer-justify-end univer-gap-2">
                <Button className="univer-min-w-16" onClick={onClose}>{localeService.t<LocaleKey>('sheets-table-ui.cancel')}</Button>
                <Button className="univer-min-w-16" variant="primary" onClick={handleConfirm}>{localeService.t<LocaleKey>('sheets-table-ui.confirm')}</Button>
            </div>
        </div>
    );
}
