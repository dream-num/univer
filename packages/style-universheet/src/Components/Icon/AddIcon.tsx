import { BaseIconProps, joinClassNames } from '@univer/base-component';

import styles from './Style/index.module.less';

// export interface BaseIconProps {
//     spin?: boolean;
//     rotate?: number;
//     style?: JSX.CSSProperties;
//     className?: string;
//     children?: ComponentChildren;
//     name?: string;
// }

// export interface AddIconProps extends BaseIconProps {
//     children?: ComponentChildren;
//     name?: string;
// }

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
