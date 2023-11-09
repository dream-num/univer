import './index.less';

import { Button, ISelectProps, Select } from '@univerjs/design';
import { FC, useMemo, useRef, useState } from 'react';

import { BusinessComponentProps } from '../base/types';
import { AccountingPanel } from './accounting';
import { CurrencyPanel } from './currency';
import { DatePanel } from './date';
import { ThousandthPercentilePanel } from './thousandth-percentile';

const options = [
    { label: '会计', component: AccountingPanel },
    { label: '货币', component: CurrencyPanel },
    { label: '日期', component: DatePanel },
    { label: '千分位符', component: ThousandthPercentilePanel },
];

export type SheetNumfmtPanelProps = {
    value: { defaultValue: number; defaultPattern: string };
    onChange: (config: { type: 'change' | 'cancel'; value: string }) => void;
};
export const SheetNumfmtPanel: FC<SheetNumfmtPanelProps> = (props) => {
    const { defaultValue, defaultPattern } = props.value;
    const [type, typeSet] = useState(options[0].label);
    const pattern = useRef('');
    const BusinessComponent = useMemo(() => options.find((item) => item.label === type)?.component, [type]);
    const handleSelect: ISelectProps['onChange'] = (value) => {
        typeSet(value);
    };
    const subProps: BusinessComponentProps = {
        onChange: (v) => {
            pattern.current = v;
        },
        defaultValue,
        defaultPattern,
    };
    const handleConfirm = () => {
        props.onChange({ type: 'change', value: pattern.current });
    };
    const selectOptions: ISelectProps['options'] = options.map((option) => ({
        label: option.label,
        value: option.label,
    }));
    const handleCancel = () => {
        props.onChange({ type: 'cancel', value: pattern.current });
    };
    return (
        <div className="numfmt-panel p-b-20">
            <div>
                <div className="label m-t-14">格式类型</div>
                <div className="m-t-8">
                    <Select onChange={handleSelect} options={selectOptions} value={type}></Select>
                </div>
                <div>{BusinessComponent && <BusinessComponent {...subProps} />}</div>
            </div>

            <div className="btn-list m-t-14 m-b-20">
                <Button size="small" onClick={handleCancel} className="m-r-12">
                    取消
                </Button>
                <Button type="primary" size="small" onClick={handleConfirm}>
                    确认
                </Button>
            </div>
        </div>
    );
};
