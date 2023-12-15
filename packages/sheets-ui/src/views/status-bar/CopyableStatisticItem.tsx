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

import { LocaleService } from '@univerjs/core';
import { MessageType, Tooltip } from '@univerjs/design';
import type { IFunctionNames } from '@univerjs/engine-formula';
import {
    FUNCTION_NAMES_COMPATIBILITY,
    FUNCTION_NAMES_MATH,
    FUNCTION_NAMES_STATISTICAL,
} from '@univerjs/engine-formula';
import { IClipboardInterfaceService, IMessageService } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';

import styles from './index.module.less';

export interface IStatisticItem {
    name: IFunctionNames;
    value: number;
    show: boolean;
    disable: boolean;
}

export const functionDisplayNames: FunctionNameMap = {
    [FUNCTION_NAMES_MATH.SUM]: 'statusbar.sum',
    [FUNCTION_NAMES_STATISTICAL.AVERAGE]: 'statusbar.average',
    [FUNCTION_NAMES_STATISTICAL.MIN]: 'statusbar.min',
    [FUNCTION_NAMES_STATISTICAL.MAX]: 'statusbar.max',
    [FUNCTION_NAMES_STATISTICAL.COUNT]: 'statusbar.count',
    [FUNCTION_NAMES_STATISTICAL.COUNTA]: 'statusbar.countA',
    [FUNCTION_NAMES_COMPATIBILITY.CONCATENATE]: 'concatenate',
};
interface FunctionNameMap {
    [key: string]: string;
}

export const CopyableStatisticItem: React.FC<IStatisticItem> = (item: IStatisticItem) => {
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const clipboardService = useDependency(IClipboardInterfaceService);

    const formateValue = formatNumber(item.value);
    const copyToClipboard = async () => {
        await clipboardService.writeText(item.value.toString());
        messageService.show({
            type: MessageType.Success,
            content: localeService.t('statusbar.copied'),
        });
    };
    return (
        <Tooltip title={localeService.t('statusbar.clickToCopy')} placement="top">
            <div key={item.name} className={styles.statisticItem} onClick={copyToClipboard}>
                <span>{`${localeService.t(
                    functionDisplayNames?.[item.name as string] || (item.name as string)
                )}: ${formateValue}`}</span>
            </div>
        </Tooltip>
    );
};

export function formatNumber(num: number) {
    if (typeof num !== 'number') {
        return 'Invalid input';
    }

    if (num >= 1e8) {
        return num.toExponential(2);
    }
    return num.toLocaleString();
}
