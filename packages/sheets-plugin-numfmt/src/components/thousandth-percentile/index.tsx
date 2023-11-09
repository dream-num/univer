import numfmt from '@univerjs/base-numfmt-engine';
import { InputNumber, SelectList } from '@univerjs/design';
import { FC, useEffect, useMemo, useState } from 'react';

import { NUMBERFORMAT } from '../../base/const/FORMATDETAIL';
import { BusinessComponentProps } from '../../base/types';
import {
    getDecimalFromPattern,
    isPatternEqualWithoutDecimal,
    isPatternHasDecimal,
    setPatternDecimal,
} from '../../utils/decimal';

export const ThousandthPercentilePanel: FC<BusinessComponentProps> = (props) => {
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, suffixSet] = useState(() => {
        const item = NUMBERFORMAT.find((item) => isPatternEqualWithoutDecimal(item.suffix, props.defaultPattern || ''));
        return item?.suffix || '';
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const preview = useMemo(() => {
        const value = numfmt.format(pattern, Number(props.defaultValue) || 0);
        return value;
    }, [pattern, props.defaultValue]);

    const isInputDisable = useMemo(() => !isPatternHasDecimal(suffix), [suffix]);

    const handleClick = (v: string) => {
        decimalSet(getDecimalFromPattern(v, 0));
        suffixSet(v);
    };

    // 处理入参变化的时候
    useEffect(() => {
        const item = NUMBERFORMAT.find((item) => isPatternEqualWithoutDecimal(item.suffix, props.defaultPattern || ''));
        item && suffixSet(item.suffix);
        const decimal = isPatternHasDecimal(props.defaultPattern || '')
            ? getDecimalFromPattern(props.defaultPattern || '', 2)
            : 0;
        decimalSet(decimal);
    }, [props.defaultPattern]);

    useEffect(() => {
        props.onChange(pattern);
    }, [pattern]);

    const options = NUMBERFORMAT.map((item) => ({ label: item.label, value: item.suffix }));

    return (
        <div>
            <div className="m-t-16 label">示例</div>
            <div className="m-t-8 preview">{preview}</div>
            <div className="m-t-16 label">小数位数</div>
            <div className="m-t-8">
                <InputNumber
                    disabled={isInputDisable}
                    value={decimal}
                    max={20}
                    min={0}
                    onChange={(value) => decimalSet(value || 0)}
                />
            </div>
            <div className="m-t-16 label"> 负数类型</div>
            <div className="m-t-8">
                <SelectList onChange={handleClick} options={options} value={suffix}></SelectList>
            </div>
            <div className="describe m-t-14">货币格式用于表示一般货币数值。会计格式可以对一列数值进行小数点对齐。</div>
        </div>
    );
};
