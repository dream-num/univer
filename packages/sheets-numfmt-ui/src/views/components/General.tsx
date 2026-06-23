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
import type { IBusinessComponentProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useLayoutEffect } from 'react';

export const isGeneralPanel = (pattern: string) => !pattern;

export function GeneralPanel(props: IBusinessComponentProps) {
    const localeService = useDependency(LocaleService);
    const { onActionChange } = props;

    useLayoutEffect(() => {
        onActionChange(() => '');
    }, [onActionChange]);

    return (
        <div>
            <div
                className={`
                  univer-mt-3.5 univer-text-sm/5 univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-numfmt-ui.generalDes')}
            </div>
        </div>
    );
}
