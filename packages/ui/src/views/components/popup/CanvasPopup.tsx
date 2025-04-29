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

import type { IPopup } from '../../../services/popup/canvas-popup.service';
import React, { useEffect, useMemo, useState } from 'react';
import { animationFrameScheduler, combineLatest, map, of, throttleTime } from 'rxjs';
import { ComponentManager } from '../../../common';
import { ICanvasPopupService } from '../../../services/popup/canvas-popup.service';
import { useDependency, useObservable, useObservableRef } from '../../../utils/di';
import { RectPopup } from './RectPopup';

interface ISingleCanvasPopupProps {
    popup: IPopup;
    children?: React.ReactNode;
}

export const SingleCanvasPopup = ({ popup, children }: ISingleCanvasPopupProps) => {
    const [hidden, setHidden] = useState(false);
    const anchorRect$ = useMemo(() => popup.anchorRect$.pipe(
        throttleTime(0, animationFrameScheduler),
        map((anchorRect) => {
            const { bottom, left, right, top } = anchorRect;
            const [x = 0, y = 0] = popup.offset ?? [];
            return {
                left: left - x,
                right: right + x,
                top: top - y,
                bottom: bottom + y,
            };
        })
    ), [popup.anchorRect$, popup.offset]);
    const hiddenRects$ = useMemo(() => popup.hiddenRects$?.pipe(throttleTime(0, animationFrameScheduler)) ?? of([]), [popup.hiddenRects$]);
    const excludeRects$ = useMemo(() => popup.excludeRects$?.pipe(throttleTime(0, animationFrameScheduler)), [popup.excludeRects$]);
    const excludeRectsRef = useObservableRef(excludeRects$, popup.excludeRects);
    const { canvasElement, hideOnInvisible = true, hiddenType = 'destroy' } = popup;

    useEffect(() => {
        if (!hideOnInvisible) {
            return;
        }

        const anchorRectSub = combineLatest([anchorRect$, hiddenRects$]).subscribe(([rectWithOffset, hiddenRects]) => {
            const rect = canvasElement.getBoundingClientRect();
            const { top, left, bottom, right } = rect;
            const rectHeight = rectWithOffset.bottom - rectWithOffset.top;
            const rectWidth = rectWithOffset.right - rectWithOffset.left;

            const isInHiddenRect = hiddenRects.some((hiddenRect) => {
                return rectWithOffset.top >= (hiddenRect.top - (0.5 * rectHeight)) &&
                    rectWithOffset.bottom <= (hiddenRect.bottom + (0.5 * rectHeight)) &&
                    rectWithOffset.left >= (hiddenRect.left - (0.5 * rectWidth)) &&
                    rectWithOffset.right <= (hiddenRect.right + (0.5 * rectWidth));
            });

            if (rectWithOffset.bottom < top || rectWithOffset.top > bottom || rectWithOffset.right < left || rectWithOffset.left > right || isInHiddenRect) {
                setHidden(true);
            } else {
                setHidden(false);
            }
        });

        return () => anchorRectSub.unsubscribe();
    }, [canvasElement, hideOnInvisible, anchorRect$, hiddenRects$]);

    if ((hidden && hiddenType === 'destroy')) {
        return null;
    }

    return (
        <RectPopup
            {...popup}
            hidden={hidden}
            anchorRect$={anchorRect$}
            direction={popup.direction}
            onClickOutside={popup.onClickOutside}
            excludeOutside={popup.excludeOutside}
            excludeRects={excludeRectsRef}
            {
                ...popup.customActive
                    ? null
                    : {
                        onPointerEnter: () => popup.onActiveChange?.(true),
                        onPointerLeave: () => popup.onActiveChange?.(false),
                    }
            }
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
