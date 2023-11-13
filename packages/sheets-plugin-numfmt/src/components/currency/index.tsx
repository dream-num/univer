import './index.less';

import { LocaleService } from '@univerjs/core';
import { InputNumber, Select, SelectList } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { currencySymbols } from '../../base/const/CURRENCY-SYMBOLS';
import { CURRENCYFORMAT } from '../../base/const/FORMATDETAIL';
import { BusinessComponentProps } from '../../base/types';
import { usePatternPreview } from '../../hooks/usePatternPreview';
import { getCurrencyType } from '../../utils/currency';
import { getDecimalFromPattern, isPatternEqualWithoutDecimal, setPatternDecimal } from '../../utils/decimal';

export const isCurrencyPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && !pattern.startsWith('_(');
};
const useEffectWithoutFirst = (cb: () => () => void, dep: any[]) => {
    const ref = useRef(false);
    useEffect(() => {
        if (!ref.current) {
            ref.current = true;
            return;
        }
        return cb();
    }, dep);
};
export const CurrencyPanel: FC<BusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [suffix, suffixSet] = useState(() => getCurrencyType(props.defaultPattern || '') || currencySymbols[0]);

    const negativeOptions = useMemo(
        () =>
            CURRENCYFORMAT.map((item) => ({
                label: item.label(suffix),
                value: item.suffix(suffix),
                color: item.color,
            })),
        [suffix]
    );

    const [pattern, patternSet] = useState(() => {
        const _defaultPattern = CURRENCYFORMAT[0].suffix(suffix);
        if (!props.defaultPattern) {
            return _defaultPattern;
        }
        const defaultPattern = props.defaultPattern;
        return (
            negativeOptions.find((item) => isPatternEqualWithoutDecimal(item.value, defaultPattern))?.value ||
            _defaultPattern
        );
    });

    const resultPattern = useMemo(() => setPatternDecimal(pattern, decimal), [pattern, decimal]);

    const preview = usePatternPreview(resultPattern, props.defaultValue);

    const currencyOptions = useMemo(() => currencySymbols.map((item) => ({ label: item, value: item })), []);

    useEffect(() => {
        props.onChange(resultPattern);
    }, [resultPattern]);

    useEffectWithoutFirst(() => {
        patternSet(negativeOptions[0].value);
        return () => {};
    }, [negativeOptions]);

    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.preview')}</div>
            <div className="m-t-8 preview" style={{ color: preview.color }}>
                {preview.result}
            </div>
            <div className="m-t-16 options ">
                <div className="option">
                    <div className="label">{t('sheet.numfmt.decimalLength')}</div>
                    <div className="m-t-8 w-120">
                        <InputNumber value={decimal} max={20} min={0} onChange={(value) => decimalSet(value || 0)} />
                    </div>
                </div>
                <div className="option">
                    <div className="label"> {t('sheet.numfmt.currencyType')}</div>
                    <div className="m-t-8 w-140">
                        <Select
                            onChange={(value) => {
                                suffixSet(value);
                                patternSet(negativeOptions[0].value);
                            }}
                            options={currencyOptions}
                            value={suffix}
                        ></Select>
                    </div>
                </div>
            </div>
            <div className="m-t-16 label"> {t('sheet.numfmt.negType')}</div>

            <div className="m-t-8">
                <SelectList onChange={patternSet} options={negativeOptions} value={pattern}></SelectList>
            </div>

            <div className="describe m-t-14">{t('sheet.numfmt.currencyDes')}</div>
        </div>
    );
};
