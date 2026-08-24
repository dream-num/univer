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

import type { ReactNode } from 'react';
import type { IPopup } from '../../../services/popup/canvas-popup.service';
import { useMemo } from 'react';
import { animationFrameScheduler, combineLatest, map, of, throttleTime } from 'rxjs';
import { ComponentManager } from '../../../common';
import { ICanvasPopupService } from '../../../services/popup/canvas-popup.service';
import { connectInjector, useDependency, useObservable, useObservableRef } from '../../../utils/di';
import { RectPopup } from './RectPopup';

interface ISingleCanvasPopupProps {
    popup: IPopup;
    children?: ReactNode;
}

export const SingleCanvasPopup = ({ popup, children }: ISingleCanvasPopupProps) => {
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
    const { boundaryInsets, canvasElement, constrainToCanvas = false, hideOnInvisible = true, hiddenType = 'destroy' } = popup;

    const hidden = useObservable(
        hideOnInvisible
            ? () => combineLatest([anchorRect$, hiddenRects$]).pipe(map(([rectWithOffset, hiddenRects]) => {
                const rect = canvasElement.getBoundingClientRect();
                const { top, left, bottom, right } = rect;
                const insetTop = constrainToCanvas ? boundaryInsets?.top ?? 0 : 0;
                const insetLeft = constrainToCanvas ? boundaryInsets?.left ?? 0 : 0;
                const rectHeight = rectWithOffset.bottom - rectWithOffset.top;
                const rectWidth = rectWithOffset.right - rectWithOffset.left;

                const isInHiddenRect = hiddenRects.some((hiddenRect) => {
                    const bufferY = Math.min(0.5 * rectHeight, 10);
                    const bufferX = Math.min(0.5 * rectWidth, 10);
                    return rectWithOffset.top >= (hiddenRect.top - bufferY) &&
                        rectWithOffset.bottom <= (hiddenRect.bottom + bufferY) &&
                        rectWithOffset.left >= (hiddenRect.left - bufferX) &&
                        rectWithOffset.right <= (hiddenRect.right + bufferX);
                });

                return rectWithOffset.bottom < top + insetTop || rectWithOffset.top > bottom ||
                    rectWithOffset.right < left + insetLeft || rectWithOffset.left > right || isInHiddenRect;
            }))
            : null,
        false,
        false,
        [anchorRect$, boundaryInsets, canvasElement, constrainToCanvas, hiddenRects$, hideOnInvisible]
    );

    if ((hidden && hiddenType === 'destroy')) {
        return null;
    }

    return (
        <RectPopup
            {...popup}
            hidden={hidden}
            anchorRect$={anchorRect$}
            boundaryElement={constrainToCanvas ? canvasElement : popup.boundaryElement}
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
        const PopupComponent = Component && popup.connectorInjector
            ? connectInjector(Component, popup.connectorInjector)
            : Component;

        return (
            <SingleCanvasPopup
                key={key}
                popup={popup}
            >
                {PopupComponent && <PopupComponent popup={popup} />}
            </SingleCanvasPopup>
        );
    });
}
