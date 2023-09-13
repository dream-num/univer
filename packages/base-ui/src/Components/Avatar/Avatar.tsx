import { BaseComponentProps } from '../../BaseComponent';
import { joinClassNames } from '../../Utils';
import styles from './Style/index.module.less';

type Shape = 'circle' | 'square';
type AvatarSize = number | 'large' | 'small' | 'default';
type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export interface BaseAvatarProps extends BaseComponentProps {
    children?: React.ReactNode;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /** The title of the image avatar */
    title?: string;

    alt?: string;

    /**
     * The shape of the avatar
     * @default 'circle'
     */
    shape?: Shape;

    /**
     * The size of the avatar
     * @default 'default'
     */
    size?: AvatarSize;

    /** The address of the image for an image avatar or image element */
    src?: string;

    /**
     * The fit of the image avatar
     * @default fill
     */
    fit?: ImageFit;

    /** Handler when img load error */
    onError?: () => void;

    /** Handler when img load success */
    onLoad?: () => void;
}

/**
 * Avatar Component
 */
export function Avatar(props: BaseAvatarProps) {
    const { children, style, title, alt, shape = 'circle', size = 'default', src, fit = 'fill', onError, onLoad } = props;

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
