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

import React, { useEffect, useRef, useState } from 'react';

import { TextEditor } from '@univerjs/ui';

const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '10px',
    top: '300px',
    width: 'calc(100% - 20px)',
    height: 'calc(100% - 300px)',
};

const editorStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '40px',
    border: '1px solid #000',
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
            <TextEditor id="test-editor-1" style={editorStyle} />
            <br></br>
            <TextEditor id="test-editor-2" style={editorStyle} />
            <br></br>
            <TextEditor id="test-editor-3" style={editorStyle} />
            <br></br>
            <TextEditor id="test-editor-4" style={editorStyle} />
        </div>
    );
};
