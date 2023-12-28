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

import { ICommandService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle } from '@univerjs/icons';
import { useDependency } from '@wendellhu/redi/react-bindings';
import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

import { CancelZenEditCommand, ConfirmZenEditCommand } from '../../commands/commands/zen-editor.command';
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY } from '../../controllers/zen-editor.controller';
import { IZenEditorManagerService } from '../../services/zen-editor.service';
import styles from './index.module.less';

const COMPONENT_PREFIX = 'ZEN_EDITOR_PLUGIN_';
export const ZEN_EDITOR_COMPONENT = `${COMPONENT_PREFIX}ZEN_EDITOR_COMPONENT`;

export function ZenEditor() {
    const editorRef = useRef<HTMLDivElement>(null);

    const renderManagerService: IRenderManagerService = useDependency(IRenderManagerService);

    const zenEditorManagerService = useDependency(IZenEditorManagerService);

    const commandService = useDependency(ICommandService);

    useEffect(() => {
        const editor = editorRef.current;

        if (!editor) {
            return;
        }

        const renderSubscription = renderManagerService.currentRender$.subscribe((param) => {
            if (param !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                return;
            }

            const engine = renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)?.engine;
            engine?.setContainer(editor);
        });

        const resizeObserver = new ResizeObserver(() => {
            const editorRect = editor.getBoundingClientRect();

            zenEditorManagerService.setPosition(editorRect);
        });

        resizeObserver.observe(editor);

        // Clean up on unmount
        return () => {
            resizeObserver.unobserve(editor);
            renderSubscription.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    function handleCloseBtnClick() {
        commandService.executeCommand(CancelZenEditCommand.id);
    }

    function handleConfirmBtnClick() {
        commandService.executeCommand(ConfirmZenEditCommand.id);
    }

    return (
        <div className={styles.zenEditor}>
            <div className={styles.zenEditorIconWrapper}>
                <span
                    className={clsx(styles.zenEditorIconContainer, styles.zenEditorIconError)}
                    onClick={handleCloseBtnClick}
                >
                    <CloseSingle style={{ fontSize: '22px' }} />
                </span>

                <span
                    className={clsx(styles.zenEditorIconContainer, styles.zenEditorIconSuccess)}
                    onClick={handleConfirmBtnClick}
                >
                    <CheckMarkSingle style={{ fontSize: '22px' }} />
                </span>
            </div>
            <div className={styles.zenEditorCanvasContainer} ref={editorRef} />
        </div>
    );
}
