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
import { useMemo } from 'react';

import { useDependency } from '../../utils/di';

export interface ICommonLabelProps {
    value: string | number;
    selections: { value: string | number; label: string }[];
}

export const CommonLabel = (props: ICommonLabelProps) => {
    const { value, selections } = props;

    const localeService = useDependency(LocaleService);

    const viewValue = useMemo(() => {
        if (value == null) return '';
        return localeService.t(selections.find((item) => item.value === value)?.label ?? '');
    }, [value, selections]);

    return (
        <div
            className="univer-overflow-hidden univer-truncate univer-text-sm"
        >
            {viewValue}
        </div>
    );
};

export const COMMON_LABEL_COMPONENT = 'UI_PLUGIN_COMMON_LABEL_COMPONENT';
