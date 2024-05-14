/**
 * Copyright 2023-present DreamNum Inc.
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

import type { TooltipRef } from 'rc-tooltip';
import RcTooltip from 'rc-tooltip';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';
import { placements } from './placements';
import { useIsEllipsis } from './hooks';

export interface ITooltipProps {
    visible?: boolean;

    placement?: 'top' | 'bottom';

    title: (() => React.ReactNode) | React.ReactNode;

    children: React.ReactElement;
    /* Tooltip only show if text is ellipsis */
    showIfEllipsis?: boolean;

    onVisibleChange?: (visible: boolean) => void;

    style?: React.CSSProperties;
}

type NullableTooltipRef = TooltipRef | null;

export const Tooltip = forwardRef<NullableTooltipRef, ITooltipProps>((props, ref) => {
    const {
        children,
        visible,
        placement = 'top',
        title,
        onVisibleChange,
        style,
        showIfEllipsis = false,
    } = props;

    const { mountContainer } = useContext(ConfigContext);
    const tooltipRef = useRef<NullableTooltipRef>(null);
    useImperativeHandle<NullableTooltipRef, NullableTooltipRef>(ref, () => tooltipRef.current);

    const isEllipsis = useIsEllipsis(showIfEllipsis ? tooltipRef.current?.nativeElement : null);
    return mountContainer && (
        <RcTooltip
            visible={(showIfEllipsis && !isEllipsis) ? false : visible}
            ref={tooltipRef}
            prefixCls={styles.tooltip}
            getTooltipContainer={() => mountContainer}
            overlay={<div className={styles.tooltipContent}>{typeof title === 'function' ? title() : title}</div>}
            builtinPlacements={placements}
            placement={placement}
            mouseEnterDelay={0.2}
            showArrow
            destroyTooltipOnHide
            onVisibleChange={onVisibleChange}
            overlayStyle={style}
        >
            {children}
        </RcTooltip>
    );
});
