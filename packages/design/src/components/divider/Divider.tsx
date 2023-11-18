import { clsx } from 'clsx';

import styles from './index.module.less';

export interface IDividerProps {
    /**
     * Semantic DOM class
     * @default '''
     * */
    className?: string;

    /**
     * Semantic DOM style
     * @default {}
     * */
    style?: React.CSSProperties;

    /**
     * horizontal or vertical type, default vertical
     * @default 'vertical'
     * */
    type?: 'horizontal' | 'vertical';

    /**
     * The color of the divider.
     * */
    color?: string;

    /**
     * The thickness of the divider.
     * @default 1
     * */
    thickness?: number;

    /**
     * The length of the divider.
     * @default '100%'
     * */
    length?: number;
}

export function Divider(props: IDividerProps) {
    const { className = '', style = {}, type = 'vertical', color, thickness = 1, length = '100%' } = props;

    const dividerStyle: React.CSSProperties = {
        backgroundColor: color,
        width: type === 'vertical' ? thickness : length,
        height: type === 'vertical' ? length : thickness,
        margin: type === 'vertical' ? `0 var(--padding-base)` : `var(--padding-base) 0`,
    };

    const _className = clsx(styles.divider, className);

    return <div className={_className} style={{ ...dividerStyle, ...style }} />;
}
