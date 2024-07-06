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

import clsx from 'clsx';
import React from 'react';

import styles from './index.module.less';

type Shape = 'circle' | 'square';
type AvatarSize = number | 'middle' | 'small';
type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export interface IAvatarProps {
    children?: React.ReactNode;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /** The title of the image avatar */
    title?: string;

    /** Image description */
    alt?: string;

    /**
     * The shape of the avatar
     * @default 'circle'
     */
    shape?: Shape;

    /**
     * The size of the avatar
     * @default 'middle'
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
export function Avatar(props: IAvatarProps) {
    const {
        children,
        style,
        title,
        alt,
        shape = 'circle',
        size = 'middle',
        src,
        fit = 'fill',
        onError,
        onLoad,
    } = props;

    const sizeStyle =
        typeof size === 'number'
            ? {
                width: `${size}px`,
                height: `${size}px`,
                lineHeight: `${size}px`,
            }
            : {};

    const _className = clsx(styles.avatar, {
        [styles.avatarCircle]: shape === 'circle',
        [styles.avatarSquare]: shape === 'square',
        [styles.avatarImage]: src,
        [styles.avatarMiddle]: size === 'middle',
        [styles.avatarSmall]: size === 'small',
    });

    const fitStyle = { objectFit: fit };

    if (src) {
        return (
            <span className={_className} style={{ ...sizeStyle, ...style, ...fitStyle }}>
                <img src={src} title={title} alt={alt} onError={onError} onLoad={onLoad} />
                {children}
            </span>
        );
    }

    return (
        <span className={_className} style={{ ...sizeStyle, ...style }}>
            {children}
        </span>
    );
}
