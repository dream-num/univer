import RcDropdown from 'rc-dropdown';

import styles from './index.module.less';

interface IDropdownProps {
    children: React.ReactElement;
    overlay: React.ReactElement;
}

export function Dropwdown2(props: IDropdownProps) {
    const { children, overlay } = props;
    console.log(styles.dropdown2);

    return (
        <RcDropdown
            {...props}
            prefixCls="univer-dropdown2"
            overlayClassName={styles.dropdown2}
            trigger={['click']}
            animation="slide-up"
            overlay={overlay}
        >
            {children}
        </RcDropdown>
    );
}
