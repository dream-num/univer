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

import type { IRange } from '@univerjs/core';
import { LocaleService } from '@univerjs/core';
import { Button, Checkbox, CheckboxGroup, FormLayout, Select } from '@univerjs/design';
import { useHighlightRange } from '@univerjs/sheets-ui';
import { IDialogService, useDependency } from '@univerjs/ui';
import { useCallback, useMemo, useState } from 'react';
import { FileNamePart, IBatchSaveImagesService } from '../../services/batch-save-images.service';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from './component-name';

export function BatchSaveImagesDialog() {
    const localeService = useDependency(LocaleService);
    const dialogService = useDependency(IDialogService);
    const batchSaveService = useDependency(IBatchSaveImagesService);

    const [fileNameParts, setFileNameParts] = useState<Array<string | number | boolean>>([FileNamePart.CELL_ADDRESS]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const images = useMemo(() => batchSaveService.getCellImagesInSelection(), [batchSaveService]);
    const dataColumns = useMemo(() => batchSaveService.getDataColumns(), [batchSaveService]);
    const rowRange = useMemo(() => batchSaveService.getSelectionRowRange(), [batchSaveService]);

    const columnOptions = useMemo(() => {
        return dataColumns.map((col) => ({
            label: col.label,
            value: String(col.index),
        }));
    }, [dataColumns]);

    const [selectedColumn, setSelectedColumn] = useState<string>(
        () => columnOptions.length > 0 ? columnOptions[0].value : '0'
    );

    // Calculate highlight range based on selected column and original selection row range
    const highlightRanges = useMemo<IRange[]>(() => {
        const showColumnSelect = fileNameParts.includes(FileNamePart.COLUMN_VALUE);
        if (!showColumnSelect || !rowRange) {
            return [];
        }

        const colIndex = Number(selectedColumn);
        return [{
            startRow: rowRange.startRow,
            endRow: rowRange.endRow,
            startColumn: colIndex,
            endColumn: colIndex,
        }];
    }, [fileNameParts, selectedColumn, rowRange]);

    // Highlight the selected column range
    useHighlightRange(highlightRanges);

    const handleFileNamePartsChange = useCallback((value: Array<string | number | boolean>) => {
        // Ensure at least one option is selected
        if (value.length === 0) {
            return;
        }
        setFileNameParts(value);
    }, []);

    const handleColumnChange = useCallback((value: string | number | boolean) => {
        setSelectedColumn(String(value));
    }, []);

    const handleCancel = useCallback(() => {
        dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID);
    }, [dialogService]);

    const handleConfirm = useCallback(async () => {
        if (images.length === 0) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await batchSaveService.saveImages(images, {
                fileNameParts: fileNameParts as FileNamePart[],
                columnIndex: fileNameParts.includes(FileNamePart.COLUMN_VALUE) ? Number(selectedColumn) : undefined,
            });

            dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID);
        } catch (err) {
            console.error('Failed to save images:', err);
            setError(localeService.t('sheetImage.save.error'));
        } finally {
            setSaving(false);
        }
    }, [batchSaveService, images, fileNameParts, selectedColumn, dialogService, localeService]);

    const showColumnSelect = fileNameParts.includes(FileNamePart.COLUMN_VALUE);

    return (
        <div className="univer-flex univer-flex-col">
            <FormLayout label={localeService.t('sheetImage.save.imageCount')}>
                <div className="univer-text-sm univer-text-gray-600">{images.length}</div>
            </FormLayout>

            <FormLayout label={localeService.t('sheetImage.save.fileNameConfig')}>
                <CheckboxGroup value={fileNameParts} onChange={handleFileNamePartsChange} direction="vertical">
                    <Checkbox value={FileNamePart.CELL_ADDRESS}>
                        {localeService.t('sheetImage.save.useRowCol')}
                    </Checkbox>
                    <Checkbox value={FileNamePart.COLUMN_VALUE}>
                        {localeService.t('sheetImage.save.useColumnValue')}
                    </Checkbox>
                </CheckboxGroup>
            </FormLayout>

            {showColumnSelect && (
                <FormLayout label={localeService.t('sheetImage.save.selectColumn')}>
                    <Select
                        value={selectedColumn}
                        options={columnOptions}
                        onChange={handleColumnChange}
                    />
                </FormLayout>
            )}

            {error && (
                <div className="univer-text-xs univer-text-red-500">{error}</div>
            )}

            <div
                className={`
                  univer-flex univer-justify-end univer-gap-2 univer-border-t univer-border-gray-200 univer-pt-3
                `}
            >
                <Button onClick={handleCancel} disabled={saving}>
                    {localeService.t('sheetImage.save.cancel')}
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={saving || images.length === 0}
                >
                    {saving ? localeService.t('sheetImage.save.saving') : localeService.t('sheetImage.save.confirm')}
                </Button>
            </div>
        </div>
    );
}
