import numfmt from '@univerjs/base-numfmt-engine';
import { LocaleService } from '@univerjs/core';
import { SelectList } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { FC, useEffect, useMemo, useState } from 'react';

import { DATEFMTLISG } from '../../base/const/FORMATDETAIL';
import { BusinessComponentProps } from '../../base/types';

export const isDatePanel = (pattern: string) => {
    const info = numfmt.getInfo(pattern);
    return DATEFMTLISG.map((item) => item.suffix).includes(pattern) || ['date', 'datetime', 'time'].includes(info.type);
};

export const DatePanel: FC<BusinessComponentProps> = (props) => {
    const options = DATEFMTLISG.map((item) => ({ label: item.label, value: item.suffix }));
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const [suffix, suffixSet] = useState(() => {
        if (props.defaultPattern) {
            const item = options.find((item) => item.value === props.defaultPattern);
            if (item) {
                return item.value;
            }
        }
        return options[0].value;
    });
    const [currentDate] = useState(() => new Date().toLocaleString());

    const preview = useMemo(() => {
        const res = numfmt.parseDate(String(props.defaultValue) || '') || numfmt.parseDate(currentDate);
        if (res) {
            return numfmt.format(suffix, Number(res.v), { locale: 'zh-CN' });
        }
        return '';
    }, [suffix, props.defaultValue]);

    useEffect(() => {
        props.onChange(suffix);
    }, [suffix]);
    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.preview')}</div>
            <div className="m-t-8 preview"> {preview} </div>
            <div className="m-t-16 label">{t('sheet.numfmt.dateType')}</div>
            <div className="m-t-8">
                <SelectList value={suffix} options={options} onChange={suffixSet}></SelectList>
            </div>
            <div className="describe m-t-14">{t('sheet.numfmt.dateDes')}</div>
        </div>
    );
};
