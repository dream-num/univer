import type { ActionType, AlignType } from '@rc-component/trigger';
import RcDropdown from 'rc-dropdown';
import Placements from 'rc-dropdown/lib/placements';

import styles from './index.module.less';

export interface IDropdown2Props {
    visible?: boolean;
    trigger?: ActionType | ActionType[];
    placement?: keyof typeof Placements;
    children: React.ReactElement;
    overlay: React.ReactElement;
    alignPoint?: boolean;
    align?: AlignType;
    onVisibleChange?: (visible: boolean) => void;
}

export function Dropdown2(props: IDropdown2Props) {
    const { trigger = ['click'], placement, children, overlay, alignPoint, align, onVisibleChange } = props;

    return (
        <RcDropdown
            {...props}
            prefixCls="univer-dropdown2"
            overlayClassName={styles.dropdown2}
            trigger={trigger}
            animation="slide-up"
            placement={placement}
            overlay={overlay}
            alignPoint={alignPoint}
            align={align}
            onVisibleChange={onVisibleChange}
        >
            {children}
        </RcDropdown>
    );
}
