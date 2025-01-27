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

import type { IDocumentData } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, DOCS_ZEN_EDITOR_UNIT_ID_KEY, DocumentFlavor, ICommandService, useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { CheckMarkSingle, CloseSingle } from '@univerjs/icons';
import clsx from 'clsx';

import React, { useEffect, useRef } from 'react';
import { CancelZenEditCommand, ConfirmZenEditCommand } from '../../commands/commands/zen-editor.command';

import { IZenEditorManagerService } from '../../services/zen-editor.service';
import styles from './index.module.less';

const COMPONENT_PREFIX = 'ZEN_EDITOR_PLUGIN_';
// eslint-disable-next-line react-refresh/only-export-components
export const ZEN_EDITOR_COMPONENT = `${COMPONENT_PREFIX}ZEN_EDITOR_COMPONENT`;

const INITIAL_SNAPSHOT: IDocumentData = {
    id: DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    body: {
        dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
        textRuns: [],
        tables: [],
        customBlocks: [],
        paragraphs: [
            {
                startIndex: 0,
            },
        ],
        sectionBreaks: [{
            startIndex: 1,
        }],
    },
    tableSource: {},
    documentStyle: {
        pageSize: {
            width: 595,
            height: Number.POSITIVE_INFINITY,
        },
        documentFlavor: DocumentFlavor.MODERN,
        marginTop: 0,
        marginBottom: 0,
        marginRight: 0,
        marginLeft: 0,
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
    },
    drawings: {},
    drawingsOrder: [],
};

export function ZenEditor() {
    const editorRef = useRef<HTMLDivElement>(null);
    const zenEditorService = useDependency(IZenEditorManagerService);
    const editorService = useDependency(IEditorService);

    const commandService = useDependency(ICommandService);

    useEffect(() => {
        const editorDom = editorRef.current;

        if (!editorDom) {
            return;
        }

        const registerSubscription = editorService.register({
            editorUnitId: DOCS_ZEN_EDITOR_UNIT_ID_KEY,
            initialSnapshot: INITIAL_SNAPSHOT,
            scrollBar: true,
            backScrollOffset: 100,
        },
        editorDom);

        const resizeObserver = new ResizeObserver(() => {
            zenEditorService.setPosition(editorDom.getBoundingClientRect());
        });

        resizeObserver.observe(editorDom);

        // Clean up on unmount
        return () => {
            registerSubscription.dispose();
            resizeObserver.unobserve(editorDom);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    function handleCloseBtnClick() {
        const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
        editor?.blur();
        commandService.executeCommand(CancelZenEditCommand.id);
    }

    function handleConfirmBtnClick() {
        const editor = editorService.getEditor(DOCS_ZEN_EDITOR_UNIT_ID_KEY);
        editor?.blur();
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
