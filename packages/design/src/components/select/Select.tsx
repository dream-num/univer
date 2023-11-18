import RcSelect from 'rc-select';
import { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface ISelectProps {
    /**
     * The value of select
     */
    value: string;

    /**
     * The options of select
     * @default []
     */
    options?: Array<{
        label: string;
        value: string;
    }>;

    /**
     * The callback function that is triggered when the value is changed
     */
    onChange: (value: string) => void;
}

export function Select(props: ISelectProps) {
    const { value, options = [], onChange } = props;

    const { mountContainer } = useContext(ConfigContext);

    return (
        <RcSelect
            prefixCls={styles.select}
            getPopupContainer={() => mountContainer}
            options={options}
            value={value}
            menuItemSelectedIcon={null}
            onChange={onChange}
        ></RcSelect>
    );
}
