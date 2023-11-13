import { FUNCTION_NAMES } from '@univerjs/base-formula-engine';
import { IMessageService } from '@univerjs/base-ui';
import { LocaleService } from '@univerjs/core';
import { MessageType, Tooltip } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';

import styles from './index.module.less';

export interface IStatisticItem {
    name: FUNCTION_NAMES;
    value: number;
    show: boolean;
}

export const functionDisplayNames: FunctionNameMap = {
    [FUNCTION_NAMES.SUM]: 'statusbar.sum',
    [FUNCTION_NAMES.AVERAGE]: 'statusbar.average',
    [FUNCTION_NAMES.MIN]: 'statusbar.min',
    [FUNCTION_NAMES.MAX]: 'statusbar.max',
    [FUNCTION_NAMES.COUNT]: 'statusbar.count',
    [FUNCTION_NAMES.CONCATENATE]: 'concatenate',
};
type FunctionNameMap = {
    [key: string]: string;
};

export const CopyableStatisticItem: React.FC<IStatisticItem> = (item: IStatisticItem) => {
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const formateValue = formatNumber(item.value);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(item.value.toString());
            messageService.show({
                type: MessageType.Success,
                content: localeService.t('statusbar.copied'),
            });
        } catch (err) {
            console.error('Unable to copy to clipboard', err);
        }
    };
    return (
        <Tooltip title={localeService.t('statusbar.clickToCopy')} placement="bottom">
            <div key={item.name} className={styles.statisticItem} onClick={copyToClipboard}>
                <span>{`${localeService.t(functionDisplayNames?.[item.name] || item.name)}: ${formateValue}`}</span>
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
