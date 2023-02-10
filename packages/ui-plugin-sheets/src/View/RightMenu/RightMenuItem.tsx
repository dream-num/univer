import { Component, Icon } from '@univerjs/base-ui';
import styles from './index.module.less';

interface IProps {
    label: string;
}

export class RightMenuItem extends Component<IProps> {
    render() {
        const { label } = this.props;

        return (
            <div className={styles.rightMenuItem}>
                {this.getLocale(label)}
                <Icon.Format.RightIcon />
            </div>
        );
    }
}
