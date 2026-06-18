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

import type { IDisposable, Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DisposableCollection, LifecycleStages } from '@univerjs/core';

export function simpleRangePopupDemo(univer: Univer, univerAPI: FUniver) {
    let activePopupWorkbookId: string | null = null;
    let activePopupDisposable: IDisposable | null = null;
    let disposed = false;
    const disposableCollection = new DisposableCollection();
    const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

    const attachPopup = (workbook = univerAPI.getActiveWorkbook()): boolean => {
        if (disposed || !workbook) {
            return false;
        }

        const workbookId = workbook.getId();
        if (activePopupWorkbookId) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }
        if (!isWorkbookCanvasMounted(workbookId)) {
            return false;
        }

        const range = worksheet.getRange('B2:D100');

        // Attach the popup to the range
        const disposable = range.attachRangePopup({
            componentKey: 'MySimplePopup',
            direction: 'right-bottom',
            offset: [0, 10],
        });

        if (!disposable) {
            return false;
        }

        activePopupDisposable = disposable;
        activePopupWorkbookId = workbookId;

        return true;
    };

    const scheduleAttachPopup = (workbook = univerAPI.getActiveWorkbook()) => {
        const delays = [0, 100, 300, 1000];
        delays.forEach((delay) => {
            const timer = setTimeout(() => {
                pendingTimers.delete(timer);
                attachPopup(workbook);
            }, delay);
            pendingTimers.add(timer);
        });
    };

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

    disposableCollection.add(
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
            if (params.stage === LifecycleStages.Rendered) {
                scheduleAttachPopup();
            }
        })
    );

    disposableCollection.add(
        univerAPI.addEvent(univerAPI.Event.WorkbookCreated, ({ workbook }) => {
            scheduleAttachPopup(workbook);
        })
    );

    univer.onDispose(() => {
        disposed = true;
        pendingTimers.forEach((timer) => clearTimeout(timer));
        pendingTimers.clear();
        activePopupDisposable?.dispose();
        activePopupDisposable = null;
        activePopupWorkbookId = null;
        disposableCollection.dispose();
    });
}

function isWorkbookCanvasMounted(workbookId: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    const canvas = document.getElementById(`univer-sheet-main-canvas_${workbookId}`);
    const rect = canvas?.getBoundingClientRect();
    return !!canvas?.parentElement && !!rect && rect.width > 0 && rect.height > 0;
}
