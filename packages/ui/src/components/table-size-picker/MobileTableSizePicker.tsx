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

import { Button, InputNumber } from '@univerjs/design';
import type { ITableSizePickerProps } from './TableSizePicker';
import { useTableSizePicker } from './TableSizePicker';

export function MobileTableSizePicker(props: ITableSizePickerProps) {
    const { labels } = props;
    const { direction, title, rows, columns, minRows, minColumns, maxRows, maxColumns, isDropdown, updateRows, updateColumns, handleConfirm } = useTableSizePicker(props);
    return (
        <section
            className="
              univer-box-border univer-grid univer-w-full univer-gap-4 univer-p-4 univer-text-gray-900
              dark:!univer-text-gray-0
            "
            dir={direction}
        >
            {title && !isDropdown && <h3 className="univer-m-0 univer-text-base univer-font-medium">{title}</h3>}
            <div
                className="
                  univer-sticky univer-top-0 univer-z-10 univer-bg-gray-0 univer-py-1
                  dark:!univer-bg-gray-800
                "
            >
                <Button className="univer-w-full" variant="primary" onClick={handleConfirm} size="middle">
                    {labels.confirm}
                </Button>
            </div>
            <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                <label className="univer-grid univer-min-w-0 univer-gap-2 univer-text-sm">
                    {labels.rows}
                    <InputNumber
                        aria-label={labels.rows}
                        className="univer-w-full"
                        controls={false}
                        min={minRows}
                        max={maxRows}
                        precision={0}
                        value={rows}
                        onChange={(value) => updateRows(value ?? minRows)}
                        size="small"
                    />
                </label>
                <label className="univer-grid univer-min-w-0 univer-gap-2 univer-text-sm">
                    {labels.columns}
                    <InputNumber
                        aria-label={labels.columns}
                        className="univer-w-full"
                        controls={false}
                        min={minColumns}
                        max={maxColumns}
                        precision={0}
                        value={columns}
                        onChange={(value) => updateColumns(value ?? minColumns)}
                        size="small"
                    />
                </label>
            </div>
        </section>
    );
}
