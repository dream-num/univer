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

import { useDependency } from '@univerjs/core';
import React from 'react';
import { ComponentManager } from '../../../common';
import { useObservable } from '../../../components/hooks/observable';
import { ICanvasPopupService } from '../../../services/popup/canvas-popup.service';
import { SingleDOMPopup } from './dom-popup';
import { SingleCanvasPopup } from './single-canvas-popup';

export function CanvasPopup() {
    const popupService = useDependency(ICanvasPopupService);
    const componentManager = useDependency(ComponentManager);
    const popups = useObservable(popupService.popups$, undefined, true);

    return popups.map((item) => {
        const [key, popup] = item;

        // e.g. Component is like: packages/sheets-ui/src/views/cell-alert/CellAlertPopup.tsx
        const Component = componentManager.get(popup.componentKey);
        if (popup.componentKey.indexOf('single-dom-popup') > -1) {
            return (
                <SingleDOMPopup
                    key={key}
                    popup={popup}
                >
                    {Component ? <Component popup={popup} /> : null}
                </SingleDOMPopup>
            );
        }
        if (popup.componentKey.indexOf('content-popups-container')) {
            return null;
        }
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

export function ContentDOMPopup() {
    const popupService = useDependency(ICanvasPopupService);
    const componentManager = useDependency(ComponentManager);
    const popups = useObservable(popupService.popups$, undefined, true);

    // const instanceService = useDependency(IUniverInstanceService);
    // const domLayerService = useDependency(CanvasFloatDomService);
    // const layers = useObservable(domLayerService.domLayers$);
    // const currentUnitId = unitId || instanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)?.getUnitId();

    // return layers?.filter((layer) => layer[1].unitId === currentUnitId)?.map((layer) => (
    //     <FloatDomSingle
    //         id={layer[0]}
    //         layer={layer[1]}
    //         key={layer[0]}
    //     />
    // ));
    // TODO @lumixraku get header height
    // const headerHeight = 40;
    return popups.map((item) => {
        const [key, popup] = item;
        const Component = componentManager.get(popup.componentKey);

        if (popup.componentKey.indexOf('content-dom-popup')) {
            return (
                <SingleDOMPopup
                    key={key}
                    popup={popup}
                >
                    {Component ? <Component popup={popup} /> : null}
                </SingleDOMPopup>
            );
        }
        return null;
    });
}
