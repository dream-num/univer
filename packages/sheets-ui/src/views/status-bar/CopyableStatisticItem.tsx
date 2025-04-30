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

import type { IFunctionNames } from '@univerjs/engine-formula';
import type { FC } from 'react';
import { LocaleService, numfmt } from '@univerjs/core';
import { MessageType, Tooltip } from '@univerjs/design';
import { FUNCTION_NAMES_MATH, FUNCTION_NAMES_STATISTICAL, FUNCTION_NAMES_TEXT } from '@univerjs/engine-formula';
import { IClipboardInterfaceService, IMessageService, useDependency } from '@univerjs/ui';

export interface IStatisticItem {
    name: IFunctionNames;
    value: number;
    show: boolean;
    disable: boolean;
    pattern: string | null;
}

const allowPatternFunctions: IFunctionNames[] = [
    FUNCTION_NAMES_MATH.SUM,
    FUNCTION_NAMES_STATISTICAL.AVERAGE,
    FUNCTION_NAMES_STATISTICAL.MIN,
    FUNCTION_NAMES_STATISTICAL.MAX,
];

export const functionDisplayNames: IFunctionNameMap = {
    [FUNCTION_NAMES_MATH.SUM]: 'statusbar.sum',
    [FUNCTION_NAMES_STATISTICAL.AVERAGE]: 'statusbar.average',
    [FUNCTION_NAMES_STATISTICAL.MIN]: 'statusbar.min',
    [FUNCTION_NAMES_STATISTICAL.MAX]: 'statusbar.max',
    [FUNCTION_NAMES_STATISTICAL.COUNT]: 'statusbar.count',
    [FUNCTION_NAMES_STATISTICAL.COUNTA]: 'statusbar.countA',
    [FUNCTION_NAMES_TEXT.CONCATENATE]: 'concatenate',
};

interface IFunctionNameMap {
    [key: string]: string;
}

export const CopyableStatisticItem: FC<IStatisticItem> = (item: IStatisticItem) => {
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const clipboardService = useDependency(IClipboardInterfaceService);

    const formateValue = formatNumber(item);

    const copyToClipboard = async () => {
        await clipboardService.writeText(item.value.toString());
        messageService.show({
            type: MessageType.Success,
            content: localeService.t('statusbar.copied'),
        });
    };
    return (
        <Tooltip title={localeService.t('statusbar.clickToCopy')} placement="top">
            <div
                key={item.name}
                className={`
                  univer-flex univer-max-w-24 univer-cursor-default univer-truncate univer-text-center univer-text-xs
                  univer-text-gray-400
                `}
                onClick={copyToClipboard}
            >
                <span>
                    {`${localeService.t(
                        functionDisplayNames?.[item.name as string] || (item.name as string)
                    )}: ${formateValue}`}
                </span>
            </div>
        </Tooltip>
    );
};

export function formatNumber(item: IStatisticItem) {
    const { pattern, value: num } = item;
    if (typeof num !== 'number') {
        return 0;
    }

    if (num >= 1e8) {
        return num.toExponential(2);
    }

    if (pattern && allowPatternFunctions.includes(item.name)) {
        return numfmt.format(pattern, num, { throws: false });
    }

    return num.toLocaleString();
}
