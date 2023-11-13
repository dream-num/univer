import { InputNumber, SelectList } from '@univerjs/design';
import { FC, useEffect, useMemo, useState } from 'react';

import { NUMBERFORMAT } from '../../base/const/FORMATDETAIL';
import { BusinessComponentProps } from '../../base/types';
import { usePatternPreview } from '../../hooks/usePatternPreview';
import {
    getDecimalFromPattern,
    isPatternEqualWithoutDecimal,
    isPatternHasDecimal,
    setPatternDecimal,
} from '../../utils/decimal';

export const ThousandthPercentilePanel: FC<BusinessComponentProps> = (props) => {
    const options = useMemo(
        () => NUMBERFORMAT.map((item) => ({ label: item.label, value: item.suffix, color: item.color })),
        []
    );
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, suffixSet] = useState(() => {
        const item = options.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern || ''));
        return item?.value || options[0].value;
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const preview = usePatternPreview(pattern, props.defaultValue);

    const isInputDisable = useMemo(() => !isPatternHasDecimal(suffix), [suffix]);

    const handleClick = (v: string) => {
        decimalSet(getDecimalFromPattern(v, 0));
        suffixSet(v);
    };

    useEffect(() => {
        props.onChange(pattern);
    }, [pattern]);

    return (
        <div>
            <div className="m-t-16 label">示例</div>
            <div className="m-t-8 preview" style={{ color: preview.color }}>
                {preview.result}
            </div>
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
