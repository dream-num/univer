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

import type { IPopup } from '../../../services/popup/canvas-popup.service';
import { useDependency } from '@univerjs/core';
import { RectPopup } from '@univerjs/design';
import React, { useEffect, useMemo, useState } from 'react';
import { animationFrameScheduler, throttleTime } from 'rxjs';
import { ComponentManager } from '../../../common';
import { useObservable } from '../../../components/hooks/observable';
import { ICanvasPopupService } from '../../../services/popup/canvas-popup.service';

interface ISingleCanvasPopupProps {
    popup: IPopup;
    children?: React.ReactNode;
}

const SingleCanvasPopup = ({ popup, children }: ISingleCanvasPopupProps) => {
    const [hidden, setHidden] = useState(false);
    const anchorRect$ = useMemo(() => popup.anchorRect$.pipe(throttleTime(0, animationFrameScheduler)), [popup.anchorRect$]);
    const excludeRects$ = useMemo(() => popup.excludeRects$?.pipe(throttleTime(0, animationFrameScheduler)), [popup.excludeRects$]);
    const anchorRect = useObservable(anchorRect$, popup.anchorRect);
    const excludeRects = useObservable(excludeRects$, popup.excludeRects);
    const { offset, canvasElement, hideOnInvisible = true, hiddenType = 'destroy' } = popup;

    // We add an offset to the anchor rect to make the popup offset with the anchor.
    const rectWithOffset = useMemo(() => {
        if (!anchorRect) {
            return null;
        }

        const { bottom, left, right, top } = anchorRect;
        const [x = 0, y = 0] = offset ?? [];
        return {
            left: left - x,
            right: right + x,
            top: top - y,
            bottom: bottom + y,
        };
    }, [anchorRect, offset]);

    useEffect(() => {
        if (!hideOnInvisible || !rectWithOffset) {
            return;
        }
        const rect = canvasElement.getBoundingClientRect();
        const { top, left, bottom, right } = rect;
        if (rectWithOffset.bottom < top || rectWithOffset.top > bottom || rectWithOffset.right < left || rectWithOffset.left > right) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    }, [rectWithOffset, canvasElement, hideOnInvisible]);

    if ((hidden && hiddenType === 'destroy') || !rectWithOffset) {
        return null;
    }

    return (
        <RectPopup
            hidden={hidden}
            anchorRect={rectWithOffset}
            direction={popup.direction}
            onClickOutside={popup.onClickOutside}
            excludeOutside={popup.excludeOutside}
            excludeRects={excludeRects}
            onPointerEnter={popup.onPointerEnter}
            onPointerLeave={popup.onPointerLeave}
            onClick={popup.onClick}
            onContextMenu={popup.onContextMenu}
        >
            {children}
        </RectPopup>
    );
};

export function CanvasPopup() {
    const popupService = useDependency(ICanvasPopupService);
    const componentManager = useDependency(ComponentManager);
    const popups = useObservable(popupService.popups$, undefined, true);

    return popups.map((item) => {
        const [key, popup] = item;
        const Component = componentManager.get(popup.componentKey);
        return (
            <SingleCanvasPopup
                key={key}
                popup={popup}
            >
                {Component ? <Component popup={popup} /> : null}
            </SingleCanvasPopup>
        );
    });
}
