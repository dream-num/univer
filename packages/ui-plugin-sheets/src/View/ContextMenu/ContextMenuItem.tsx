import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Component } from 'react';

import styles from './index.module.less';

interface IProps {
    label: string;
}

export class ContextMenuItem extends Component<IProps> {
    override render() {
        const { label } = this.props;

        const localeService = useDependency(LocaleService);

        return (
            <div className={styles.rightMenuItem}>
                {localeService.t(label)}
                {/* <Icon.Format.RightIcon /> */}
            </div>
        );
    }
}
