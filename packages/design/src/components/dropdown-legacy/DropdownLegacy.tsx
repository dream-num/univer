/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ActionType, AlignType } from '@rc-component/trigger';
import type Placements from 'rc-dropdown/lib/placements';
import type { ReactElement } from 'react';
import RcDropdown from 'rc-dropdown';
import { useContext } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import './index.css';

export interface IDropdownLegacyProps {
    /** Semantic DOM class */
    className?: string;

    /**
     * The dropdown content
     */
    children: ReactElement;

    /**
     * Whether the dropdown is visible
     */
    visible?: boolean;

    /**
     * Whether to force render the dropdown
     * @default false
     */
    forceRender?: boolean;

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

    /** Disable dropdown from showing up. */
    disabled?: boolean;
}

/** @deprecated */
export function DropdownLegacy(props: IDropdownLegacyProps) {
    const {
        className,
        placement,
        children,
        overlay,
        alignPoint = false,
        align,
        disabled,
        onVisibleChange,
    } = props;

    const trigger = disabled ? [] : (props.trigger || ['click']);

    const { mountContainer } = useContext(ConfigContext);

    return mountContainer && (
        <RcDropdown
            {...props}
            overlayClassName={className}
            prefixCls="univer-dropdown"
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
