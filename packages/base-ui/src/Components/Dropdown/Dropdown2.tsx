import RcDropdown from 'rc-dropdown';
import Placements from 'rc-dropdown/lib/placements';

import styles from './index.module.less';

interface IDropdownProps {
    placement?: keyof typeof Placements;
    children: React.ReactElement;
    overlay: React.ReactElement;
}

export function Dropwdown2(props: IDropdownProps) {
    const { placement, children, overlay } = props;

    return (
        <RcDropdown
            {...props}
            prefixCls="univer-dropdown2"
            overlayClassName={styles.dropdown2}
            trigger={['click']}
            animation="slide-up"
            placement={placement}
            overlay={overlay}
        >
            {children}
        </RcDropdown>
    );
}
