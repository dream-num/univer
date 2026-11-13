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

import { Button, clsx, InputNumber, Separator } from '@univerjs/design';
import { useState } from 'react';

export interface ITableSize {
    rows: number;
    columns: number;
}

export interface ITableSizePickerProps {
    initialRows?: number;
    initialColumns?: number;
    maxGridRows?: number;
    maxGridColumns?: number;
    minRows?: number;
    minColumns?: number;
    maxRows?: number;
    maxColumns?: number;
    variant?: 'card' | 'dropdown';
    direction?: 'ltr' | 'rtl';
    title?: string;
    labels: { rows: string; columns: string; customSize: string; confirm: string; size: (columns: number, rows: number) => string };
    onConfirm: (size: ITableSize) => void;
}

const DEFAULT_ROWS = 3;
const DEFAULT_COLUMNS = 5;
const DEFAULT_GRID_ROWS = 10;
const DEFAULT_GRID_COLUMNS = 14;
const DEFAULT_MAX_ROWS = 50;
const DEFAULT_MAX_COLUMNS = 50;
function normalizeTableSizeValue(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    return Math.min(Math.max(Math.floor(value), min), max);
}

export function useTableSizePicker(props: Omit<ITableSizePickerProps, 'labels'>) {
    const {
        initialRows = DEFAULT_ROWS,
        initialColumns = DEFAULT_COLUMNS,
        maxGridRows = DEFAULT_GRID_ROWS,
        maxGridColumns = DEFAULT_GRID_COLUMNS,
        minRows = 1,
        minColumns = 1,
        maxRows = DEFAULT_MAX_ROWS,
        maxColumns = DEFAULT_MAX_COLUMNS,
        variant = 'card',
        direction = 'ltr',
        title,
        onConfirm,
    } = props;
    const [rows, setRows] = useState(() => normalizeTableSizeValue(initialRows, minRows, maxRows));
    const [columns, setColumns] = useState(() => normalizeTableSizeValue(initialColumns, minColumns, maxColumns));
    const [hoverSize, setHoverSize] = useState<ITableSize | null>(null);
    const selectedRows = hoverSize?.rows ?? rows;
    const selectedColumns = hoverSize?.columns ?? columns;
    const isDropdown = variant === 'dropdown';

    const updateRows = (value: number) => setRows(normalizeTableSizeValue(value, minRows, maxRows));
    const updateColumns = (value: number) => setColumns(normalizeTableSizeValue(value, minColumns, maxColumns));
    const handleConfirm = () => onConfirm({ rows, columns });

    return { direction, title, rows, columns, minRows, minColumns, maxRows, maxColumns, maxGridRows, maxGridColumns, setHoverSize, selectedRows, selectedColumns, isDropdown, updateRows, updateColumns, handleConfirm, onConfirm };
}

export function TableSizePicker(props: ITableSizePickerProps) {
    const { labels } = props;
    const { direction, title, rows, columns, minRows, minColumns, maxRows, maxColumns, maxGridRows, maxGridColumns, setHoverSize, selectedRows, selectedColumns, isDropdown, updateRows, updateColumns, handleConfirm, onConfirm } = useTableSizePicker(props);
    const renderGrid = (compact: boolean) => (
        <div
            className={compact ? 'univer-grid univer-gap-0.5' : 'univer-grid univer-gap-1'}
            style={{ gridTemplateColumns: `repeat(${Math.min(maxGridColumns, maxColumns)}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: Math.min(maxGridRows, maxRows) }).map((_, rowIndex) => (
                Array.from({ length: Math.min(maxGridColumns, maxColumns) }).map((__, columnIndex) => {
                    const cellRows = rowIndex + 1;
                    const cellColumns = columnIndex + 1;
                    const selected = cellRows <= selectedRows && cellColumns <= selectedColumns;

                    return (
                        <button
                            key={`${cellRows}:${cellColumns}`}
                            type="button"
                            aria-label={labels.size(cellColumns, cellRows)}
                            disabled={cellRows < minRows || cellColumns < minColumns}
                            data-selected={selected}
                            className={clsx(`
                              univer-cursor-pointer univer-border univer-border-solid univer-p-0
                              univer-transition-colors
                            `, compact
                                ? 'univer-size-4 univer-rounded-sm'
                                : 'univer-size-5 univer-rounded', selected && compact && `
                                  univer-border-primary-500 univer-bg-primary-100
                                  hover:univer-bg-primary-200
                                `, selected && !compact && 'univer-border-primary-500 univer-bg-primary-50', !selected && `
                                  univer-border-gray-200 univer-bg-gray-50
                                  hover:univer-border-primary-300 hover:univer-bg-primary-50
                                `, !compact && 'dark:!univer-border-gray-700 dark:!univer-bg-gray-800')}
                            onMouseEnter={() => setHoverSize({ rows: cellRows, columns: cellColumns })}
                            onFocus={() => setHoverSize({ rows: cellRows, columns: cellColumns })}
                            onClick={() => onConfirm({ rows: cellRows, columns: cellColumns })}
                        />
                    );
                })
            ))}
        </div>
    );

    if (isDropdown) {
        return (
            <section
                className="
                  univer-box-border univer-w-[300px] univer-rounded-lg univer-bg-gray-0 univer-p-2 univer-text-gray-900
                  dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                "
                data-u-comp="table-size-picker"
                dir={direction}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onMouseLeave={() => setHoverSize(null)}
            >
                {renderGrid(true)}

                <div dir="ltr" className="univer-mt-2 univer-text-center univer-text-sm univer-font-medium">
                    {selectedColumns}
                    {' × '}
                    {selectedRows}
                </div>

                <div
                    className="
                      univer-mt-2 univer-border-0 univer-border-t univer-border-solid univer-border-gray-200 univer-pt-3
                    "
                >
                    <div className="univer-mb-2 univer-text-xs univer-text-gray-500">
                        {labels.customSize}
                    </div>
                    <div className="univer-grid univer-grid-cols-2 univer-gap-2">
                        <label className="univer-grid univer-gap-1 univer-text-xs univer-text-gray-500">
                            <span>{labels.rows}</span>
                            <InputNumber
                                aria-label={labels.rows}
                                className="univer-w-full"
                                min={minRows}
                                max={maxRows}
                                precision={0}
                                value={rows}
                                onChange={(value) => updateRows(value ?? minRows)}
                            />
                        </label>
                        <label className="univer-grid univer-gap-1 univer-text-xs univer-text-gray-500">
                            <span>{labels.columns}</span>
                            <InputNumber
                                aria-label={labels.columns}
                                className="univer-w-full"
                                min={minColumns}
                                max={maxColumns}
                                precision={0}
                                value={columns}
                                onChange={(value) => updateColumns(value ?? minColumns)}
                            />
                        </label>
                        <Button
                            className="univer-col-span-2 univer-w-full"
                            variant="primary"
                            onClick={handleConfirm}
                        >
                            {labels.confirm}
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div
            className="
              univer-box-border univer-w-[360px] univer-rounded-lg univer-border univer-border-gray-200 univer-bg-gray-0
              univer-p-4 univer-shadow-lg
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            "
            data-u-comp="table-size-picker"
            dir={direction}
            onMouseLeave={() => setHoverSize(null)}
        >
            {title && (
                <div
                    className="
                      univer-mb-3 univer-text-sm univer-font-medium univer-text-gray-900
                      dark:!univer-text-gray-100
                    "
                >
                    {title}
                </div>
            )}
            <div className="univer-flex univer-flex-col univer-items-center">
                {renderGrid(false)}
                <div
                    dir="ltr"
                    className="
                      univer-mt-4 univer-text-xl univer-font-medium univer-text-gray-900
                      dark:!univer-text-gray-100
                    "
                >
                    {selectedColumns}
                    {' × '}
                    {selectedRows}
                </div>
            </div>

            <Separator />

            <div
                className="
                  univer-mb-3 univer-text-sm univer-font-medium univer-text-gray-600
                  dark:!univer-text-gray-300
                "
            >
                {labels.customSize}
            </div>
            <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                <label className="univer-block univer-min-w-0">
                    <span
                        className="
                          univer-mb-1 univer-block univer-text-sm univer-text-gray-600
                          dark:!univer-text-gray-300
                        "
                    >
                        {labels.rows}
                    </span>
                    <InputNumber
                        aria-label={labels.rows}
                        className="univer-w-full"
                        min={minRows}
                        max={maxRows}
                        precision={0}
                        value={rows}
                        onChange={(value) => updateRows(value ?? minRows)}
                    />
                </label>
                <label className="univer-block univer-min-w-0">
                    <span
                        className="
                          univer-mb-1 univer-block univer-text-sm univer-text-gray-600
                          dark:!univer-text-gray-300
                        "
                    >
                        {labels.columns}
                    </span>
                    <InputNumber
                        aria-label={labels.columns}
                        className="univer-w-full"
                        min={minColumns}
                        max={maxColumns}
                        precision={0}
                        value={columns}
                        onChange={(value) => updateColumns(value ?? minColumns)}
                    />
                </label>
            </div>
            <Button className="univer-mt-3 univer-w-full" variant="primary" onClick={handleConfirm}>
                {labels.confirm}
            </Button>
        </div>
    );
}
