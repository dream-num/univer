import { CustomLabel, Icon } from '@univerjs/base-ui';
import { Component } from 'react';

import styles from './index.module.less';

interface IProps {
    label: string;
}

export class RightMenuItem extends Component<IProps> {
    override render() {
        const { label } = this.props;

        return (
            <div className={styles.rightMenuItem}>
                <CustomLabel label={label} />
                <Icon.Format.RightIcon />
            </div>
        );
    }
}
