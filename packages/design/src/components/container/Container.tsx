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

import type { Ref } from 'react';
import React, { forwardRef } from 'react';

export interface IContainerProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /** Set the handler to handle `click` event */
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    /** Set the handler to handle `onContextMenu` event */
    onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * Container Component
 */
export const Container = forwardRef((props: IContainerProps, ref: Ref<HTMLDivElement>) => {
    const { children, className, style, onClick, onContextMenu } = props;

    return (
        <section ref={ref} className={className} style={style} onClick={onClick} onContextMenu={onContextMenu}>
            {children}
        </section>
    );
});
