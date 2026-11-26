/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { VariantProps } from 'class-variance-authority';
import type { CSSProperties, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { useState } from 'react';
import { clsx } from '../../helper/clsx';

type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

const avatarVariants = cva(
    `
      univer-relative univer-inline-block univer-select-none univer-overflow-hidden univer-whitespace-nowrap
      univer-bg-gray-200 univer-text-center univer-align-middle univer-font-medium univer-text-gray-700
      dark:!univer-bg-gray-700 dark:!univer-text-gray-100
    `,
    {
        variants: {
            /**
             * The shape of the avatar
             * @default 'circle'
             */
            shape: {
                circle: 'univer-rounded-full',
                square: 'univer-rounded',
            },
            size: {
                middle: 'univer-size-9 univer-text-sm univer-leading-9',
                small: 'univer-size-7 univer-text-xs univer-leading-7',
            },
        },
        defaultVariants: {
            shape: 'circle',
            size: 'middle',
        },
    }
);

export interface IAvatarProps extends Omit<VariantProps<typeof avatarVariants>, 'size'> {
    children?: ReactNode;

    className?: string;

    /** Semantic DOM style */
    style?: CSSProperties;

    /** The title of the image avatar */
    title?: string;

    /** Image description */
    alt?: string;

    /**
     * The size of the avatar
     * @default 'middle'
     */
    size?: 'small' | 'middle' | number;

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
        className,
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

    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showImage = Boolean(src) && failedSrc !== src;

    const sizeStyle =
        typeof size === 'number'
            ? {
                width: `${size}px`,
                height: `${size}px`,
                lineHeight: `${size}px`,
            }
            : {};

    return (
        <span
            data-u-comp="avatar"
            className={clsx(avatarVariants({
                shape,
                size: typeof size === 'number' ? 'middle' : size,
            }), {
                'univer-bg-transparent dark:!univer-bg-transparent': showImage,
            }, className)}
            style={{
                ...sizeStyle,
                ...style,
            }}
        >
            {showImage
                ? (
                    <img
                        className="univer-block univer-size-full"
                        style={{ objectFit: fit }}
                        src={src}
                        title={title}
                        alt={alt}
                        onError={() => {
                            setFailedSrc(src ?? null);
                            onError?.();
                        }}
                        onLoad={onLoad}
                    />
                )
                : children}
        </span>
    );
}
