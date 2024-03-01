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

import React from 'react';

import { TextEditor } from '@univerjs/ui';

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '10px',
    top: '300px',
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 300px)',
};

const editorStyle: React.CSSProperties = {
    width: '100%',
};

/**
 * Floating editor's container.
 * @returns
 */
export const TestEditorContainer = () => {
    return (
        <div
            style={containerStyle}
        >
            <TextEditor id="test-editor-1" isReadonly={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} value="I found one cent on the roadside." />
            <br></br>
            <TextEditor id="test-editor-2" onlyInputFormula={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} />
            <br></br>
            <TextEditor id="test-editor-3" onlyInputRange={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} />
            <br></br>
            <TextEditor id="test-editor-4" isSingle={false} style={{ ...editorStyle, height: '140px' }} canvasStyle={{ fontSize: 14 }} />
        </div>
    );
};
