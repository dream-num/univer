import React from 'react';

import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

type Shape = 'circle' | 'square';
// type BreakPoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
// type AvatatScreen = Partial<Record<BreakPoint, number>>;
// type AvatarSize = number | 'large' | 'small' | 'default' | AvatatScreen;
type AvatarSize = number | 'large' | 'small' | 'default';
type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export interface BaseAvatarProps extends BaseComponentProps {
    alt?: string;
    shape?: Shape;
    size?: AvatarSize;
    src?: string;
    style?: React.CSSProperties;
    fit?: ImageFit;
    children?: any;
    onError?: () => void;
    onLoad?: () => void;
    title?: string;
}

export interface AvatarComponent extends BaseComponent<BaseAvatarProps> {
    render(): JSXComponent<BaseAvatarProps>;
}
