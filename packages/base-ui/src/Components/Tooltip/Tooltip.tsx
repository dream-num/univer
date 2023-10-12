import RcTooltip from 'rc-tooltip';

import styles from './index.module.less';
import { placements } from './placements';

export interface ITooltipProps {
    placement?: 'top' | 'bottom';
    title: (() => React.ReactNode) | React.ReactNode;
    children: React.ReactElement;
}

export const Tooltip = (props: ITooltipProps) => {
    const { children, placement = 'top', title } = props;

    return (
        <RcTooltip
            prefixCls={styles.tooltip}
            overlay={<div className={styles.tooltipContent}>{typeof title === 'function' ? title() : title}</div>}
            builtinPlacements={placements}
            placement={placement}
            mouseLeaveDelay={0.1}
            mouseEnterDelay={0.2}
            showArrow
            destroyTooltipOnHide
        >
            {children}
        </RcTooltip>
    );
};
