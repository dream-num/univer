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

import type { ByColorsModel } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';

/**
 * Filter by colors.
 */
export function FilterByColor(props: { model: ByColorsModel }) {
    const { model } = props;

    const localeService = useDependency(LocaleService);

    const bgColors = model.bgColors;
    const fontColors = model.fontColors;

    return (
        <div
            data-u-comp="sheets-filter-panel-colors-container"
            className="univer-flex univer-h-full univer-min-h-[300px] univer-flex-col"
        >
            <div
                data-u-comp="sheets-filter-panel"
                className={clsx(`
                  univer-mt-2 univer-box-border univer-flex univer-flex-grow univer-flex-col univer-overflow-hidden
                  univer-rounded-md univer-px-2 univer-py-2.5
                `, borderClassName)}
            />
        </div>
    );
}
