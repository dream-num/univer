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

import { IContextService, LocaleService, ThemeService } from '@univerjs/core';
import type { CURSOR_TYPE, IMouseEvent } from '@univerjs/engine-render';
import {
    DeviceType,
    IRenderManagerService,
    RenderManagerService,
    Scene,
    SpreadsheetSkeleton,
    ThinEngine,
} from '@univerjs/engine-render';
import type { ISelectionWithCoordAndStyle } from '@univerjs/sheets';
import { DesktopPlatformService, DesktopShortcutService, IPlatformService, IShortcutService } from '@univerjs/ui';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { SelectionRenderService } from '../selection-render.service';
import { createCommandTestBed } from './create-service-test-bed';

const theme = {
    colorBlack: '#35322b',
};

const mockEvent: IMouseEvent = {
    altKey: false,
    button: 0,
    buttons: 1,
    clientX: 150,
    clientY: 200,
    layerX: 0,
    layerY: 0,
    ctrlKey: false,
    metaKey: false,
    movementX: 0,
    movementY: 0,
    mozMovementX: 0, // Optional, specific to Firefox, can be undefined
    mozMovementY: 0, // Optional, specific to Firefox, can be undefined
    msMovementX: 0, // Optional, specific to Microsoft browsers, can be undefined or any type
    msMovementY: 0, // Optional, specific to Microsoft browsers, can be undefined or any type
    offsetX: 75,
    offsetY: 100,
    shiftKey: false,
    webkitMovementX: 0, // Optional, specific to WebKit browsers, can be undefined or any type
    webkitMovementY: 0, // Optional, specific to WebKit browsers, can be undefined or any type
    x: 150, // Alias of clientX
    y: 200,
    deviceType: DeviceType.Generic,
    inputIndex: 0,
    previousState: undefined,
    currentState: undefined,
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    returnValue: false,
    srcElement: null,
    target: null,
    timeStamp: 0,
    type: '',
    composedPath(): EventTarget[] {
        throw new Error('Function not implemented.');
    },
    initEvent(type: string, bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
        throw new Error('Function not implemented.');
    },
    preventDefault(): void {
        throw new Error('Function not implemented.');
    },
    stopImmediatePropagation(): void {
        throw new Error('Function not implemented.');
    },
    stopPropagation(): void {
        throw new Error('Function not implemented.');
    },
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3,
    detail: 0,
    view: null,
    which: 0,
    initUIEvent(
        typeArg: string,
        bubblesArg?: boolean | undefined,
        cancelableArg?: boolean | undefined,
        viewArg?: Window | null | undefined,
        detailArg?: number | undefined
    ): void {
        throw new Error('Function not implemented.');
    },
    pageX: 0,
    pageY: 0,
    relatedTarget: null,
    screenX: 0,
    screenY: 0,
    getModifierState(keyArg: string): boolean {
        throw new Error('Function not implemented.');
    },
    initMouseEvent(
        typeArg: string,
        canBubbleArg: boolean,
        cancelableArg: boolean,
        viewArg: Window,
        detailArg: number,
        screenXArg: number,
        screenYArg: number,
        clientXArg: number,
        clientYArg: number,
        ctrlKeyArg: boolean,
        altKeyArg: boolean,
        shiftKeyArg: boolean,
        metaKeyArg: boolean,
        buttonArg: number,
        relatedTargetArg: EventTarget | null
    ): void {
        throw new Error('Function not implemented.');
    },
};

class MockEngine extends ThinEngine<Scene> {
    setRemainCapture(): void {
        // empty
    }

    clearCanvas() {
        // empty
    }

    getCanvas() {
        return 1 as any;
    }

    getCanvasElement() {
        return 1 as any;
    }

    setCanvasCursor(val: CURSOR_TYPE) {
        // empty
    }

    getPixelRatio() {
        return 1;
    }
}

describe('Test indirect', () => {
    // const textFunction = new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY);
    let get: Injector['get'];

    let themeService: ThemeService;
    let selectionRenderService: SelectionRenderService;

    let selectionStartParam: ISelectionWithCoordAndStyle[];

    let selectionMovingParam: ISelectionWithCoordAndStyle[];

    let selectionEndParam: ISelectionWithCoordAndStyle[];

    let selectionServiceUsable: boolean;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IShortcutService, { useClass: DesktopShortcutService }],
            [SheetSkeletonManagerService],
            [SelectionRenderService],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IRenderManagerService, { useClass: RenderManagerService }],
        ]);

        get = testBed.get;

        const localeService = get(LocaleService);
        const contextService = get(IContextService);

        themeService = get(ThemeService);
        themeService.setTheme(theme);

        selectionRenderService = get(SelectionRenderService);

        const workbook = testBed.sheet;

        const worksheet = workbook?.getActiveSheet();

        const config = worksheet.getConfig();

        const skeleton = new SpreadsheetSkeleton(
            worksheet,
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles(),
            localeService,
            contextService
        );

        const scene = new Scene('', new MockEngine());

        selectionRenderService.changeRuntime(skeleton, scene);

        selectionRenderService.selectionMoveStart$.subscribe((param) => {
            selectionStartParam = param;
        });

        selectionRenderService.selectionMoving$.subscribe((param) => {
            selectionMovingParam = param;
        });

        selectionRenderService.selectionMoveEnd$.subscribe((param) => {
            selectionEndParam = param;
        });

        selectionRenderService.usable$.subscribe((param) => {
            selectionServiceUsable = param;
        });

        selectionRenderService.eventTrigger(mockEvent);

        scene.triggerPointerMove({ ...mockEvent, offsetX: 200 });

        scene.triggerPointerUp({ ...mockEvent, offsetX: 500 });
    });

    describe('normal', () => {
        it('Observer is valid', () => {
            expect(selectionServiceUsable).toBeTruthy();

            expect(selectionStartParam == null).toBeFalsy();

            expect(selectionMovingParam == null).toBeFalsy();

            expect(selectionEndParam == null).toBeFalsy();
        });

        it('selectionStart', () => {
            const { startRow, startColumn, endRow, endColumn } = selectionStartParam[0].rangeWithCoord;
            expect({ startRow, startColumn, endRow, endColumn }).toStrictEqual({
                startRow: 3,
                startColumn: 0,
                endRow: 3,
                endColumn: 0,
            });
        });

        it('selectionMoving', () => {
            const { startRow, startColumn, endRow, endColumn } = selectionMovingParam[0].rangeWithCoord;
            expect({ startRow, startColumn, endRow, endColumn }).toStrictEqual({
                startRow: 3,
                startColumn: 0,
                endRow: 3,
                endColumn: 2,
            });
        });

        it('selectionEnd', () => {
            const { startRow, startColumn, endRow, endColumn } = selectionEndParam[0].rangeWithCoord;
            expect({ startRow, startColumn, endRow, endColumn }).toStrictEqual({
                startRow: 3,
                startColumn: 0,
                endRow: 3,
                endColumn: 2,
            });
        });
    });
});
