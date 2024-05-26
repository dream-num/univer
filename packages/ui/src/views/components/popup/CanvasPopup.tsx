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

import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useMemo } from 'react';
import { RectPopup } from '@univerjs/design';
import type { IBoundRectNoAngle } from '@univerjs/engine-render';
import { ICanvasPopupService } from '../../../services/popup/canvas-popup.service';
import { useObservable } from '../../../components/hooks/observable';
import { ComponentManager } from '../../../common';
import type { IPopup } from '../../../services/popup/canvas-popup.service';

const SingleCanvasPopup = ({ popup, children }: { popup: IPopup; children?: React.ReactNode }) => {
    const anchorRect = useObservable(popup.anchorRect$, popup.anchorRect);
    const { bottom, left, right, top } = anchorRect;
    const { offset } = popup;

    // We add an offset to the anchor rect to make the popup offset with the anchor.
    const rectWithOffset: IBoundRectNoAngle = useMemo(() => {
        const [x = 0, y = 0] = offset ?? [];
        return {
            left: left - x,
            right: right + x,
            top: top - y,
            bottom: bottom + y,
        };
    }, [bottom, left, right, top, offset]);

    return (
        <RectPopup
            anchorRect={rectWithOffset}
            direction={popup.direction}
            onClickOutside={popup.onClickOutside}
            excludeOutside={popup.excludeOutside}
            closeOnSelfTarget={popup.closeOnSelfTarget}
        >
            {children}
        </RectPopup>
    );
};

export function CanvasPopup() {
    const popupService = useDependency(ICanvasPopupService);
    const popups = useObservable(popupService.popups$, undefined, true);
    const componentManager = useDependency(ComponentManager);
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
