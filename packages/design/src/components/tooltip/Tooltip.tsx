import RcTooltip from 'rc-tooltip';
import { useContext } from 'react';

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
