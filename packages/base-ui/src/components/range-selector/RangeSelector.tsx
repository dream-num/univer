import { Input } from '@univerjs/design';

import styles from './index.module.less';

export function RangeSelector() {
    return (
        <div className={styles.rangeSelector}>
            <Input placeholder="Select range or input value"></Input>
        </div>
    );
}
