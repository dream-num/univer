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

import RcTooltip from 'rc-tooltip';
import React, { useContext } from 'react';

import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';
import { placements } from './placements';

export interface ITooltipProps {
    placement?: 'top' | 'bottom';
    title: (() => React.ReactNode) | React.ReactNode;
    children: React.ReactElement;
}

export const Tooltip = (props: ITooltipProps) => {
    const { children, placement = 'top', title } = props;

    const { mountContainer } = useContext(ConfigContext);

    return (
        <RcTooltip
            prefixCls={styles.tooltip}
            getTooltipContainer={() => mountContainer}
            overlay={<div className={styles.tooltipContent}>{typeof title === 'function' ? title() : title}</div>}
            builtinPlacements={placements}
            placement={placement}
            mouseEnterDelay={0.2}
            showArrow
            destroyTooltipOnHide
        >
            {children}
        </RcTooltip>
    );
};
