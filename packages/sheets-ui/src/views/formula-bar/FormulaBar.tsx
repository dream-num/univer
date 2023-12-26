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
import { CheckMarkSingle, CloseSingle, DropdownSingle, FxSingle } from '@univerjs/icons';
import { KeyCode } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import styles from './index.module.less';

enum ArrowDirection {
    Down,
    Up,
}

interface IFormulaState {
    iconStyle: string;
    arrowDirection: ArrowDirection;
}

export function FormulaBar() {
    const [iconStyle, setIconStyle] = useState<string>(styles.formulaGrey);
    const [arrowDirection, setArrowDirection] = useState<ArrowDirection>(ArrowDirection.Down);

    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);

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

            formulaEditorManagerService.setPosition(editorRect);
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

    function handleArrowClick() {
        setArrowDirection(arrowDirection === ArrowDirection.Down ? ArrowDirection.Up : ArrowDirection.Down);
    }

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

    function handlerFxBtnClick() {
        formulaEditorManagerService.handleFxBtnClick(true);
    }

    return (
        <div className={styles.formulaBox} style={{ height: ArrowDirection.Down === arrowDirection ? '28px' : '82px' }}>
            <div className={styles.nameRanges}>
                <div className={styles.nameRangesInput} />
            </div>

            <div className={styles.formulaBar}>
                <div className={styles.formulaIcon}>
                    <div className={styles.formulaIconWrapper}>
                        <span
                            className={clsx(styles.iconContainer, styles.iconContainerError, iconStyle)}
                            onClick={handleCloseBtnClick}
                        >
                            <CloseSingle />
                        </span>

                        <span
                            className={clsx(styles.iconContainer, styles.iconContainerSuccess, iconStyle)}
                            onClick={handleConfirmBtnClick}
                        >
                            <CheckMarkSingle />
                        </span>

                        <span className={styles.iconContainer} onClick={handlerFxBtnClick}>
                            <FxSingle />
                        </span>
                    </div>
                </div>

                <div className={styles.formulaInput}>
                    <div onContextMenu={(e) => e.preventDefault()} className={styles.formulaContent} ref={editorRef} />
                    <div className={styles.arrowContainer} onClick={handleArrowClick}>
                        {arrowDirection === ArrowDirection.Down ? (
                            <DropdownSingle />
                        ) : (
                            <DropdownSingle style={{ transform: 'rotateZ(180deg)' }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
