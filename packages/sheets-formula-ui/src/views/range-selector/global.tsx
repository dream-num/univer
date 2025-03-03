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

import type { IRangeSelectorInstance } from './index';
import { deserializeRangeWithSheet } from '@univerjs/engine-formula';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef } from 'react';
import { GlobalRangeSelectorService } from '../../services/range-selector.service';
import { RangeSelector } from './index';

export const GlobalRangeSelector = () => {
    const rangeSelectorService = useDependency(GlobalRangeSelectorService);
    const current = useObservable(rangeSelectorService.currentSelector$);
    const instance = useRef<IRangeSelectorInstance | null>(null);

    useEffect(() => {
        if (current) {
            instance.current?.showDialog(current.initialValue ?? []);

            return () => {
                instance.current?.hideDialog();
            };
        }
    }, [current]);

    return (
        <RangeSelector
            unitId={current?.unitId ?? ''}
            subUnitId={current?.subUnitId ?? ''}
            hideEditor
            selectorRef={instance}
            onChange={(_, value) => {
                current?.callback(value?.split(',').map((i) => deserializeRangeWithSheet(i)) ?? []);
            }}
        />
    );
};
