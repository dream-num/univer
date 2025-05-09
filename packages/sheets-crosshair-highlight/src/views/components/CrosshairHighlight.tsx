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

import { borderClassName, clsx } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';
import { CROSSHAIR_HIGHLIGHT_COLORS, SheetsCrosshairHighlightService } from '../../services/crosshair.service';

export interface ICrosshairOverlayProps {
    onChange?: (value: string) => void;
}

export function CrosshairOverlay(props: ICrosshairOverlayProps) {
    const { onChange } = props;

    const crosshairSrv = useDependency(SheetsCrosshairHighlightService);

    const currentColor = useObservable(crosshairSrv.color$);

    const handleColorPicked = useCallback((color: string) => {
        onChange?.(color);
    }, [onChange]);

    return (
        <div className="univer-grid univer-grid-cols-8 univer-gap-x-2 univer-gap-y-3">
            {CROSSHAIR_HIGHLIGHT_COLORS.map((color: string) => {
                return (
                    <div
                        key={color}
                        className={clsx(`
                          univer-box-border univer-size-5 univer-cursor-pointer univer-rounded univer-ring-offset-1
                          univer-transition-shadow
                          hover:univer-ring-[1.5px] hover:univer-ring-primary-600/40
                        `, borderClassName, {
                            'univer-ring-[1.5px] univer-ring-primary-600 hover:univer-ring-primary-600': color === currentColor,
                        })}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorPicked(color)}
                    />
                );
            })}
        </div>
    );
}
