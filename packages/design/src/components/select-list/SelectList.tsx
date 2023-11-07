import { CheckMarkSingle } from '@univerjs/icons';
import clsx from 'clsx';

import styles from './index.module.less';

export interface ISelectListProps {
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

export function SelectList(props: ISelectListProps) {
    const { value, options = [], onChange } = props;

    function handleSelect(value: string) {
        onChange(value);
    }

    return (
        <ul className={styles.selectList}>
            {options.map((option) => (
                <li
                    key={option.value}
                    className={clsx(styles.selectListItem, { [styles.selectListItemSelect]: value === option.value })}
                >
                    <a onClick={() => handleSelect(option.value)}>
                        <span className={styles.selectListItemIcon}>
                            {value === option.value && <CheckMarkSingle />}
                        </span>
                        {option.label}
                    </a>
                </li>
            ))}
        </ul>
    );
}
