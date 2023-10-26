import { IExtendProps } from '@univerjs/icons';

import { joinClassNames } from '../../Utils';
import styles from './Style/index.module.less';

export interface BaseIconProps {
    spin?: boolean;
    rotate?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    name?: string;
    width?: string;
    height?: string;
    color?: string;
    extend?: IExtendProps;
}
export const Icon = (props: BaseIconProps) => {
    const { spin, rotate, children, name, style, className } = props;

    let svgStyle;
    if (style) {
        svgStyle = style;
        svgStyle.transform = rotate ? `rotate(${rotate}deg)` : '';
    } else {
        svgStyle = rotate ? { transform: `rotate(${rotate}deg)` } : {};
    }

    const classes = joinClassNames(
        styles.icon,
        {
            [`${styles.icon}-${name}`]: name,
            [`${styles.icon}-spin`]: spin || name === 'loading',
        },
        className
    );

    return (
        <span role="img" className={classes} style={{ ...svgStyle }}>
            {children}
        </span>
    );
};
