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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRangeSelectorProps } from '../../../basics/editor/range';
import { Injector, isValidRange, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { FormLayout, Input } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { setEndForRange } from '@univerjs/sheets';
import { ComponentManager, useDependency } from '@univerjs/ui';
import React, { useMemo } from 'react';
import { RANGE_SELECTOR_COMPONENT_KEY } from '../../../common/keys';
import { checkRangeValid } from '../util';

interface IPermissionDetailMainPartProps {
    permissionId: string;
    ranges: IRange[];
    onRangesChange: (ranges: IRange[], err?: string) => void;
    rangesErrMsg?: string;
    desc?: string;
    onDescChange: (desc: string) => void;
}

export const PermissionDetailMainPart = (props: IPermissionDetailMainPartProps) => {
    const { ranges, onRangesChange, desc, onDescChange, rangesErrMsg, permissionId } = props;
    const componentManager = useDependency(ComponentManager);
    const RangeSelector: React.ComponentType<IRangeSelectorProps> = useMemo(() => componentManager.get(RANGE_SELECTOR_COMPONENT_KEY), []) as any;
    const univerInstanceService = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);
    const injector = useDependency(Injector);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const worksheet = workbook?.getActiveSheet();
    if (!workbook || !worksheet) {
        return null;
    }
    const unitId = workbook.getUnitId();
    const subUnitId = worksheet.getSheetId();

    const handleRangeChange = (rangeText: string) => {
        const newRange = rangeText.split(',').map(deserializeRangeWithSheet).map((item) => item.range);
        if (newRange.some((i) => !isValidRange(i) || i.endColumn < i.startColumn || i.endRow < i.startRow)) {
            return;
        }

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return;
        }
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const transformedRange = newRange.map((range) => {
            const rowCount = worksheet.getRowCount();
            const colCount = worksheet.getColumnCount();
            setEndForRange(range, rowCount, colCount);
            return range;
        });
        const rangeErrorString = checkRangeValid(injector, transformedRange, permissionId, unitId, subUnitId);
        onRangesChange(transformedRange, rangeErrorString);
    };

    return (
        <>
            <FormLayout
                className="univer-font-medium"
                label={localeService.t('permission.panel.protectedRange')}
                error={rangesErrMsg}
            >
                {RangeSelector && (
                    <RangeSelector
                        unitId={unitId}
                        subUnitId={subUnitId}
                        initialValue={ranges?.map((i) => serializeRange(i)).join(',')}
                        onChange={(_, text) => handleRangeChange(text)}
                    />
                )}
            </FormLayout>
            <FormLayout className="univer-font-medium" label={localeService.t('permission.panel.permissionDirection')}>
                <Input
                    value={desc}
                    onChange={(v) => onDescChange(v)}
                    placeholder={localeService.t('permission.panel.permissionDirectionPlaceholder')}
                />
            </FormLayout>
        </>
    );
};
