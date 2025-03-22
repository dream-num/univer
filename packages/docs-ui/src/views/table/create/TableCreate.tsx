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

import { LocaleService } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';

import { useEffect, useState } from 'react';

interface IDocCreateTableConfirmProps {
    handleRowColChange: (rowCount: number, colCount: number) => void;
    tableCreateParams: {
        rowCount: number;
        colCount: number;
    };
}

export const DocCreateTableConfirm = ({
    handleRowColChange,
    tableCreateParams,
}: IDocCreateTableConfirmProps) => {
    const localeService = useDependency(LocaleService);

    const [rowCount, setRowCount] = useState(3);
    const [colCount, setColCount] = useState(5);

    function handleInputChange(rowCount: number, colCount: number) {
        setRowCount(rowCount);
        setColCount(colCount);
        handleRowColChange(rowCount, colCount);
    }

    useEffect(() => {
        setRowCount(tableCreateParams.rowCount);
        setColCount(tableCreateParams.colCount);
    }, [tableCreateParams]);

    return (
        <div className="univer-flex univer-items-center univer-justify-between">
            <div className="univer-flex univer-items-center univer-gap-2">
                <span>{localeService.t('toolbar.table.rowCount')}</span>
                <InputNumber
                    className="univer-w-28"
                    min={1}
                    max={20}
                    precision={0}
                    value={rowCount}
                    onChange={(val) => { handleInputChange(val as number, colCount); }}
                />
            </div>
            <div className="univer-flex univer-items-center univer-gap-2">
                <span>{localeService.t('toolbar.table.colCount')}</span>
                <InputNumber
                    className="univer-w-28"
                    min={1}
                    max={20}
                    precision={0}
                    value={colCount}
                    onChange={(val) => { handleInputChange(rowCount, val as number); }}
                />
            </div>
        </div>
    );
};
