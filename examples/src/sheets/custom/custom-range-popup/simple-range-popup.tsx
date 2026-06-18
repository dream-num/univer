import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { LifecycleStages } from '@univerjs/core';

export function simpleRangePopupDemo(univer: Univer, univerAPI: FUniver) {
    const attachedWorkbookIds = new Set<string>();
    const attachPopup = (workbook = univerAPI.getActiveWorkbook()): boolean => {
        if (!workbook || attachedWorkbookIds.has(workbook.getId())) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
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

        attachedWorkbookIds.add(workbook.getId());
        return true;
    };

    const scheduleAttachPopup = (workbook = univerAPI.getActiveWorkbook()) => {
        const delays = [0, 100, 300, 1000];
        delays.forEach((delay) => {
            setTimeout(() => {
                attachPopup(workbook);
            }, delay);
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

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (params) => {
        if (params.stage === LifecycleStages.Rendered) {
            scheduleAttachPopup();
        }
    });

    univerAPI.addEvent(univerAPI.Event.WorkbookCreated, ({ workbook }) => {
        scheduleAttachPopup(workbook);
    });
}
