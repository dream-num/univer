/**
 * Copyright 2023-present DreamNum Inc.
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
import { Injector, isValidRange, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { FormLayout, Input } from '@univerjs/design';
import { deserializeRangeWithSheet, serializeRange } from '@univerjs/engine-formula';
import { setEndForRange } from '@univerjs/sheets';
import { ComponentManager } from '@univerjs/ui';
import React, { useMemo } from 'react';
import { RANGE_SELECTOR_COMPONENT_KEY } from '../../../common/keys';
import { checkRangeValid } from '../util';
import styles from './index.module.less';

interface IPermissionDetailMainPartProps {
    permissionId: string;
    ranges: IRange[];
    onRangesChange: (ranges: IRange[], err?: string) => void;
    isFocusRangeSelector: boolean;
    rangesErrMsg?: string;
    desc?: string;
    onDescChange: (desc: string) => void;
    rangeSelectorRef: React.MutableRefObject<any>;
    onFocus: () => void;
}

export const PermissionDetailMainPart = (props: IPermissionDetailMainPartProps) => {
    const { ranges, onRangesChange, rangeSelectorRef, desc, onDescChange, rangesErrMsg, isFocusRangeSelector, permissionId, onFocus } = props;
    const componentManager = useDependency(ComponentManager);
    const RangeSelector = useMemo(() => componentManager.get(RANGE_SELECTOR_COMPONENT_KEY), []);
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
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.protectedRange')}>
                {RangeSelector && (
                    <RangeSelector
                        unitId={unitId}
                        errorText={rangesErrMsg}
                        subUnitId={subUnitId}
                        initValue={ranges?.map((i) => serializeRange(i)).join(',')}
                        onChange={handleRangeChange}
                        onFocus={onFocus}
                        isFocus={isFocusRangeSelector}
                        actions={rangeSelectorRef.current}
                    />
                )}
            </FormLayout>
            <FormLayout className={styles.sheetPermissionPanelTitle} label={localeService.t('permission.panel.permissionDirection')}>
                <Input
                    value={desc}
                    onChange={(v) => onDescChange(v)}
                    placeholder={localeService.t('permission.panel.permissionDirectionPlaceholder')}
                />
            </FormLayout>
        </>
    );
};
