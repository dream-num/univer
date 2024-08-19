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

import { useDependency, useObservable } from '@univerjs/core';
import React from 'react';

import { Dropdown } from '@univerjs/design';
import { SheetsCrosshairHighlightService } from '../../services/ch.service';

export const CROSSHAIR_HIGHLIGHT_COLORS = [];

export function CrosshairHighlight() {
    const service = useDependency(SheetsCrosshairHighlightService);
    const crosshairHighlightTurnedOn = useObservable(service.turnedOn$);
    const crosshairHighlightColor = useObservable(service.color$);

    return (
        <Dropdown trigger="click" overlay={<CrosshairOverlay />} placement="top">
            <div>
                Crosshair
                {' '}
                <span>
                    {crosshairHighlightColor}
                    -
                    {crosshairHighlightTurnedOn}
                </span>
            </div>
        </Dropdown>
    );
}

function CrosshairOverlay() {
    return (
        <div>
            Overlay Here
        </div>
    );
}
