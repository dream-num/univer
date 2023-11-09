import numfmt from '@univerjs/base-numfmt-engine';
import { SelectList } from '@univerjs/design';
// import * as all from 'numfmt';
import { FC, useEffect, useMemo, useState } from 'react';

import { DATEFMTLISG } from '../../base/const/FORMATDETAIL';
import { BusinessComponentProps } from '../../base/types';

export const DatePanel: FC<BusinessComponentProps> = (props) => {
    const options = DATEFMTLISG.map((item) => ({ label: item.label, value: item.suffix }));

    const [suffix, suffixSet] = useState(DATEFMTLISG[0].suffix);
    const [currentDate] = useState(() => new Date().toLocaleString());

    const preview = useMemo(() => {
        const res = numfmt.parseDate(props.defaultValue || '') || numfmt.parseDate(currentDate);
        if (res) {
            return numfmt.format(suffix, res.v);
        }
        return '';
    }, [suffix, props.defaultValue]);

    useEffect(() => {
        props.onChange(suffix);
    }, [suffix]);
    return (
        <div>
            <div className="m-t-16 label">示例</div>
            <div className="m-t-8 preview"> {preview} </div>
            <div className="m-t-16 label">日期类型</div>
            <div className="m-t-8">
                <SelectList value={suffix} options={options} onChange={suffixSet}></SelectList>
            </div>
            <div className="describe m-t-14">
                日期格式将日期和时间系列数值品示为日期值。以星号（*）
                开头的日期格式导出后响应操作系统特定的区域日期和时间。不带星号的格式导出后不受操作系统设置影响。
            </div>
        </div>
    );
};
