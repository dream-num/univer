import { BaseAvatarProps } from '../../Interfaces';
import { joinClassNames } from '../../Utils';
import styles from './Style/index.module.less';

// type Shape = 'circle' | 'square';
// type BreakPoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
// type AvatatScreen = Partial<Record<BreakPoint, number>>;
// type AvatarSize = number | 'large' | 'small' | 'default' | AvatatScreen;
// type AvatarSize = number | 'large' | 'small' | 'default';
// type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

// export interface AvatarProps {
//     alt?: string;
//     shape?: Shape;
//     size?: AvatarSize;
//     src?: string;
//     style?: JSX.CSSProperties;
//     fit?: ImageFit;
//     children?: any;
//     onError?: () => void;
//     onLoad?: () => void;
//     title?: string;
// }

export function Avatar(props: BaseAvatarProps) {
    const { alt, shape = 'circle', size, src, onError, style, fit = 'fill', children, onLoad, title } = props;

    // const responseSize = () => {
    //     if (size instanceof Object) {
    //     }
    // };

    const sizeStyle =
        typeof size === 'number'
            ? {
                  width: size,
                  height: size,
                  lineHeight: `${size}px`,
              }
            : {};

    const prefix = styles.avatar;

    const classes = joinClassNames(prefix, {
        [`${prefix}-${shape}`]: shape,
        [`${prefix}-image`]: src,
        [`${prefix}-lg`]: size === 'large',
        [`${prefix}-sm`]: size === 'small',
    });

    const fitStyle = fit ? { objectFit: fit } : {};
    if (src) {
        return (
            <span className={classes} style={{ ...sizeStyle, ...style, ...fitStyle }}>
                <img src={src} title={title} alt={alt} onError={onError} onLoad={onLoad} />
                {children}
            </span>
        );
    }

    return (
        <span className={classes} style={{ ...sizeStyle, ...style }}>
            {children}
        </span>
    );
}
