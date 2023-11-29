import { MoreDownSingle } from '@univerjs/icons';
import RcSelect from 'rc-select';
import React, { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

interface IOption {
    label?: string;
    value?: string;
    options?: IOption[];
}

export interface ISelectProps {
    /**
     * The value of select
     */
    value: string;

    /**
     * The options of select
     * @default []
     */
    options?: IOption[];

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string) => void;
}

export function Select(props: ISelectProps) {
    const { value, options = [], onChange } = props;

    const { mountContainer } = useContext(ConfigContext);

    console.log(options);

    return (
        <RcSelect
            prefixCls={styles.select}
            getPopupContainer={() => mountContainer}
            options={options}
            value={value}
            menuItemSelectedIcon={null}
            suffixIcon={<MoreDownSingle />}
            onChange={onChange}
        />
    );
}
