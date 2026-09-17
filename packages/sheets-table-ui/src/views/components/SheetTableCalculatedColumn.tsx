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
import { Button, FormLayout, Input, Select } from '@univerjs/design';
import { SetSheetTableCommand, TableManager } from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

interface ISheetTableCalculatedColumnProps {
    unitId: string;
    tableId: string;
}

export function SheetTableCalculatedColumn({ unitId, tableId }: ISheetTableCalculatedColumnProps) {
    const localeService = useDependency(LocaleService);
    const commands = useDependency(ICommandService);
    const manager = useDependency(TableManager);
    const table = manager.getTableById(unitId, tableId);
    const columns = table?.getTableInfo().columns ?? [];
    const [columnId, setColumnId] = useState(columns[0]?.id ?? '');
    const [formula, setFormula] = useState(columns[0]?.formula ?? '');
    const [result, setResult] = useState<boolean>();
    const range = table?.getTableFilterRange();

    const apply = (value: string) => {
        try {
            const success = commands.syncExecuteCommand(SetSheetTableCommand.id, {
                unitId,
                tableId,
                calculatedColumn: { columnId, formula: value },
            });
            setResult(success);
            if (success) {
                setFormula(value);
            }
        } catch {
            setResult(false);
        }
    };

    return (
        <fieldset className="univer-m-0 univer-min-w-0 univer-border-0 univer-p-0" disabled={!table}>
            <legend className="univer-mb-2 univer-text-sm">{localeService.t<LocaleKey>('sheets-table-ui.calculatedColumn')}</legend>
            <Select
                className="univer-w-full"
                options={columns.map((column) => ({ value: column.id, label: column.displayName }))}
                value={columnId}
                onChange={(id) => {
                    setColumnId(id);
                    setFormula(table?.getColumn(id)?.formula ?? '');
                    setResult(undefined);
                }}
            />
            <FormLayout label={localeService.t<LocaleKey>('sheets-table-ui.columnFormula')}>
                <Input
                    value={formula}
                    onChange={(value) => {
                        setFormula(value);
                        setResult(undefined);
                    }}
                />
            </FormLayout>
            <p className="univer-text-sm univer-text-gray-500">
                {localeService.t<LocaleKey>('sheets-table-ui.columnFormulaHint', String(Math.max(0, (range?.endRow ?? -1) - (range?.startRow ?? 0) + 1)))}
            </p>
            <div className="univer-flex univer-flex-wrap univer-gap-2">
                <Button disabled={!columnId || !formula.trim()} onClick={() => apply(formula)}>
                    {localeService.t<LocaleKey>('sheets-table-ui.applyColumnFormula')}
                </Button>
                <Button disabled={!table?.getColumn(columnId)?.formula} onClick={() => apply('')}>
                    {localeService.t<LocaleKey>('sheets-table-ui.stopColumnFormula')}
                </Button>
            </div>
            {result !== undefined && (
                <p role={result ? 'status' : 'alert'} className="univer-text-sm">
                    {localeService.t<LocaleKey>(result ? 'sheets-table-ui.columnFormulaApplied' : 'sheets-table-ui.settingsError')}
                </p>
            )}
        </fieldset>
    );
}
