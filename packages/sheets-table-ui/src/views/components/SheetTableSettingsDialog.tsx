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
import { ICommandService, LocaleService } from '@univerjs/core';
import { ActionRow, Button, Checkbox } from '@univerjs/design';
import { SetSheetTableCommand, TableManager } from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { SheetTableCalculatedColumn } from './SheetTableCalculatedColumn';

export interface ISheetTableSettingsDialogProps {
    unitId: string;
    tableId: string;
    onClose: () => void;
    ActionRowComponent?: typeof ActionRow;
}

export function SheetTableSettingsDialog(props: ISheetTableSettingsDialogProps) {
    const { unitId, tableId, onClose, ActionRowComponent = ActionRow } = props;
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const tableManager = useDependency(TableManager);
    const [initial] = useState(() => tableManager.getTableById(unitId, tableId)?.getTableInfo());
    const [showAutoFilter, setShowAutoFilter] = useState(initial?.showAutoFilter ?? true);
    const [columns, setColumns] = useState<Record<string, boolean>>(() =>
        Object.fromEntries((initial?.columns ?? []).map((column) => [column.id, column.showFilterButton !== false])));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    const handleConfirm = async () => {
        if (!initial || saving) {
            return;
        }
        const changedColumns = Object.fromEntries(initial.columns
            .filter((column) => columns[column.id] !== (column.showFilterButton !== false))
            .map((column) => [column.id, columns[column.id]]));
        if (showAutoFilter === initial.showAutoFilter && Object.keys(changedColumns).length === 0) {
            onClose();
            return;
        }
        setSaving(true);
        setError(false);
        try {
            const success = await commandService.executeCommand(SetSheetTableCommand.id, {
                unitId,
                tableId,
                filterButtons: {
                    ...(showAutoFilter === initial.showAutoFilter ? {} : { showAutoFilter }),
                    columns: changedColumns,
                },
            });
            if (success) {
                onClose();
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="univer-flex univer-flex-col univer-gap-4 univer-py-2">
            <Checkbox checked={showAutoFilter} disabled={saving || !initial} onChange={(value) => setShowAutoFilter(Boolean(value))}>
                {localeService.t<LocaleKey>('sheets-table-ui.showFilterButtons')}
            </Checkbox>
            <p className="univer-m-0 univer-text-sm univer-text-gray-500">
                {localeService.t<LocaleKey>('sheets-table-ui.filterButtonsHint')}
            </p>
            <fieldset className="univer-m-0 univer-min-w-0 univer-border-0 univer-p-0" disabled={!showAutoFilter || saving}>
                <legend className="univer-mb-2 univer-text-sm">
                    {localeService.t<LocaleKey>('sheets-table-ui.columnFilterButtons')}
                </legend>
                <div className="univer-flex univer-max-h-64 univer-flex-col univer-gap-2 univer-overflow-y-auto">
                    {initial?.columns.map((column) => (
                        <Checkbox
                            key={column.id}
                            checked={columns[column.id]}
                            disabled={!showAutoFilter || saving}
                            onChange={(value) => setColumns((previous) => ({ ...previous, [column.id]: Boolean(value) }))}
                        >
                            {column.displayName}
                        </Checkbox>
                    ))}
                </div>
            </fieldset>
            <SheetTableCalculatedColumn unitId={unitId} tableId={tableId} />
            {error && <div role="alert" className="univer-text-sm univer-text-red-500">{localeService.t<LocaleKey>('sheets-table-ui.settingsError')}</div>}
            <ActionRowComponent className="univer-flex univer-justify-end univer-gap-2">
                <Button disabled={saving} onClick={onClose}>{localeService.t<LocaleKey>('sheets-table-ui.cancel')}</Button>
                <Button variant="primary" disabled={saving || !initial} onClick={handleConfirm}>{localeService.t<LocaleKey>('sheets-table-ui.confirm')}</Button>
            </ActionRowComponent>
        </div>
    );
}
