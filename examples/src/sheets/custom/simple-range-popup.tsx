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

import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { LifecycleStages } from '@univerjs/core';
import React from 'react';

export function simpleRangePopupDemo(univer: Univer, univerAPI: FUniver) {
    // Register a custom component
    univerAPI.registerComponent('MySimplePopup', () => (
        <div
            style={{
                padding: '8px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: '#333',
            }}
        >
            Hello from Range Popup!
        </div>
    ));

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
        if (params.stage === LifecycleStages.Rendered) {
            // Get the active sheet and a range
            const workbook = univerAPI.getActiveWorkbook();
            const worksheet = workbook!.getActiveSheet();
            const range = worksheet.getRange('B2:D100');

            // Attach the popup to the range
            range.attachRangePopup({
                componentKey: 'MySimplePopup',
                direction: 'right-bottom',
                offset: [0, 10],
            });
        }
    });
}
