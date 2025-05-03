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

import { Button } from '@univerjs/design';

import React from 'react';

export interface IBaseSheetBarButtonProps {
    children?: React.ReactNode;

    /** Semantic DOM class */
    className?: string;

    /** Semantic DOM style */
    style?: React.CSSProperties;

    /**
     * Disabled state of button
     * @default false
     */
    disabled?: boolean;

    /** Set the handler to handle `click` event */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Button Component
 */
export function SheetBarButton(props: IBaseSheetBarButtonProps) {
    const { children, className, style, disabled = false, onClick, ...restProps } = props;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        onClick && onClick(e);
    };

    return (
        <Button data-u-comp="sheet-bar-append-button" size="small" disabled={disabled} onClick={handleClick} style={style} {...restProps} variant="text" className={className}>
            {children}
        </Button>
    );
}
