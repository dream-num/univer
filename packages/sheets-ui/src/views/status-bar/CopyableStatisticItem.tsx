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
}

export const functionDisplayNames: FunctionNameMap = {
    [FUNCTION_NAMES_MATH.SUM]: 'statusbar.sum',
    [FUNCTION_NAMES_STATISTICAL.AVERAGE]: 'statusbar.average',
    [FUNCTION_NAMES_STATISTICAL.MIN]: 'statusbar.min',
    [FUNCTION_NAMES_STATISTICAL.MAX]: 'statusbar.max',
    [FUNCTION_NAMES_STATISTICAL.COUNT]: 'statusbar.count',
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
