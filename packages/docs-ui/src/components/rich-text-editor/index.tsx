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

export interface IRichTextEditorProps {
    /**
     * The unique identifier of the editor.
     */
    id: string;

    /**
     * The class name of the editor.
     */
    className?: string;

    /**
     * The style of the editor.
     */
    style?: React.CSSProperties;

    /**
     * The maximum width of the editor.
     */
    maxWidth?: number;

    /**
     * The maximum height of the editor.
     */
    maxHeight?: number;

    /**
     * Whether the editor is auto-sized.
     */
    autoSize?: boolean;

    /**
     * Whether the editor is readonly.
     */
    readonly?: boolean;

    /**
     * The initial snapshot of the editor.
     */
    initialSnapshot?: IDocumentData;

    /**
     * The callback function when the editor is active.
     */
    onActive?: (active: boolean) => void;

    /**
     * The callback function when the editor is changed.
     */
    onChange?: (snapshot: IDocumentData) => void;

    /**
     * The background color of the editor.
     */
    background?: string;

    /**
     * Whether the editor is enabled to move by keyboard.
     */
    enableMoveByKeyborad?: boolean;
}
