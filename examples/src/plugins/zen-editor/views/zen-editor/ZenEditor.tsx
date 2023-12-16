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

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

enum ArrowDirection {
    Down,
    Up,
}

const COMPONENT_PREFIX = 'ZEN_EDITOR_PLUGIN_';
export const ZEN_EDITOR_COMPONENT = `${COMPONENT_PREFIX}ZEN_EDITOR_COMPONENT`;

export function ZenEditor() {
    const [iconStyle, setIconStyle] = useState<string>(styles.formulaGrey);
    const [arrowDirection, setArrowDirection] = useState<ArrowDirection>(ArrowDirection.Down);

    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const editorBridgeService = useDependency(IEditorBridgeService);

    useEffect(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const renderSubscription = renderManagerService.currentRender$.subscribe((param) => {
            if (param !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return;
            }

            const engine = renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)?.engine;
            engine?.setContainer(editor);
        });

        const resizeObserver = new ResizeObserver(() => {
            const editorRect = editor.getBoundingClientRect();

            // formulaEditorManagerService.setPosition(editorRect);
        });

        resizeObserver.observe(editor);

        editorBridgeService.visible$.subscribe((visibleInfo) => {
            setIconStyle(visibleInfo.visible ? styles.formulaActive : styles.formulaGrey);
        });

        // Clean up on unmount
        return () => {
            resizeObserver.unobserve(editor);
            renderSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    function handleCloseBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode: KeyCode.ESC,
            });
        }
    }

    function handleConfirmBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
            });
        }
    }

    return (
        <div className={styles.zenEditor}>
            <div className={styles.canvasContainer} ref={editorRef} />
            HELLO WORLD
        </div>
    );
}
