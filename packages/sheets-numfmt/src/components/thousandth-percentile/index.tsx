import { LocaleService } from '@univerjs/core';
import { InputNumber, SelectList } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React, { useMemo, useState } from 'react';

import type { IBusinessComponentProps } from '../../base/types';
import {
    getDecimalFromPattern,
    isPatternEqualWithoutDecimal,
    isPatternHasDecimal,
    setPatternDecimal,
} from '../../utils/decimal';
import { getNumberFormatOptions } from '../../utils/options';

export const isThousandthPercentilePanel = (pattern: string) =>
    getNumberFormatOptions().some((item) => isPatternEqualWithoutDecimal(item.value, pattern));

export const ThousandthPercentilePanel: FC<IBusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);

    const options = useMemo(getNumberFormatOptions, []);
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, suffixSet] = useState(() => {
        const item = options.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern || ''));
        return item?.value || options[0].value;
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const isInputDisable = useMemo(() => !isPatternHasDecimal(suffix), [suffix]);

    const handleClick = (v: string) => {
        decimalSet(getDecimalFromPattern(v, 0));
        suffixSet(v);
    };

    props.action.current = () => pattern;

    return (
        <div>
            <div className="m-t-16 label">{localeService.t('sheet.numfmt.decimalLength')}</div>
            <div className="m-t-8">
                <InputNumber
                    disabled={isInputDisable}
                    value={decimal}
                    max={20}
                    min={0}
                    onChange={(value) => decimalSet(value || 0)}
                />
            </div>
            <div className="m-t-16 label"> {localeService.t('sheet.numfmt.negType')}</div>
            <div className="m-t-8">
                <SelectList onChange={handleClick} options={options} value={suffix} />
            </div>
            <div className="describe m-t-14">{localeService.t('sheet.numfmt.thousandthPercentileDes')}</div>
        </div>
    );
};
