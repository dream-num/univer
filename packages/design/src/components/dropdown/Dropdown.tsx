import type { ActionType, AlignType } from '@rc-component/trigger';
import RcDropdown from 'rc-dropdown';
import type Placements from 'rc-dropdown/lib/placements';
import React, { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

// TODO: @jikkai Need to limit width
export interface IDropdownProps {
    /**
     * The dropdown content
     */
    children: React.ReactElement;

    /**
     * Whether the dropdown is visible
     */
    visible?: boolean;

    /**
     * The trigger mode which executes the dropdown action
     * @default ['click']
     */
    trigger?: ActionType | ActionType[];

    /**
     * The placement of the dropdown
     */
    placement?: keyof typeof Placements;

    /**
     * The dropdown overlay
     */
    overlay: React.ReactElement;

    /**
     * Whether the dropdown aligns to the point
     * @default false
     */
    alignPoint?: boolean;

    /**
     * The align of the dropdown
     */
    align?: AlignType;

    /**
     * Triggered after the dropdown visibility changes
     * @param visible
     */
    onVisibleChange?: (visible: boolean) => void;
}

export function Dropdown(props: IDropdownProps) {
    const { trigger = ['click'], placement, children, overlay, alignPoint = false, align, onVisibleChange } = props;

    const { mountContainer } = useContext(ConfigContext);

    return (
        <RcDropdown
            {...props}
            prefixCls={styles.dropdown}
            getPopupContainer={() => mountContainer}
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
