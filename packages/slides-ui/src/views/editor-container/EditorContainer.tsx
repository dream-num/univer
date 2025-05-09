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

import type { IDocumentData } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentFlavor, IContextService } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '@univerjs/engine-render';
import { DISABLE_AUTO_FOCUS_KEY, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { SLIDE_EDITOR_ID } from '../../const';
import { ISlideEditorManagerService } from '../../services/slide-editor-manager.service';

interface ICellIEditorProps { }

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_DEFAULT_POSITION = {
    width: 0,
    height: 0,
    top: HIDDEN_EDITOR_POSITION,
    left: HIDDEN_EDITOR_POSITION,
};

/**
 * Floating editor's container.
 * @returns
 */

export const SlideEditorContainer: React.FC<ICellIEditorProps> = () => {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });

    const slideEditorManagerService = useDependency(ISlideEditorManagerService);
    const editorService = useDependency(IEditorService);
    const contextService = useDependency(IContextService);

    const disableAutoFocus = useObservable(
        () => contextService.subscribeContextValue$(DISABLE_AUTO_FOCUS_KEY),
        false,
        undefined,
        [contextService, DISABLE_AUTO_FOCUS_KEY]
    );

    const snapshot: IDocumentData = {
        id: SLIDE_EDITOR_ID,
        body: {
            dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [],
            paragraphs: [
                {
                    startIndex: 0,
                },
            ],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.UNSPECIFIED,
        },
    };

    useEffect(() => {
        slideEditorManagerService.state$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const {
                startX = HIDDEN_EDITOR_POSITION,
                startY = HIDDEN_EDITOR_POSITION,
                endX = 0,
                endY = 0,
                show = false,
            } = param;

            if (!show) {
                setState({
                    ...EDITOR_DEFAULT_POSITION,
                });
            } else {
                setState({
                    width: endX - startX - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
                    height: endY - startY - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
                    left: startX + FIX_ONE_PIXEL_BLUR_OFFSET,
                    top: startY + FIX_ONE_PIXEL_BLUR_OFFSET,
                });

                const editor = editorService.getEditor(SLIDE_EDITOR_ID);

                if (editor == null) {
                    return;
                }

                const { left, top, width, height } = editor.getBoundingClientRect();

                slideEditorManagerService.setRect({ left, top, width, height });
            }
        });
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    useEffect(() => {
        if (!disableAutoFocus) {
            slideEditorManagerService.setFocus(true);
        }
    }, [disableAutoFocus, state]);

    return (
        <div
            className={clsx('univer-absolute univer-z-10 univer-box-border univer-flex', borderClassName)}
            style={{
                left: state.left,
                top: state.top,
                width: state.width,
                height: state.height,
            }}
        >
            {/* <RichTextEditor
                editorId={SLIDE_EDITOR_ID}
                className={styles.editorInput}
                initialValue={snapshot}
                isSingle={false}
            /> */}
        </div>
    );
};
