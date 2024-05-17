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

import React, { useState } from 'react';

import { RangeSelector, TextEditor } from '@univerjs/ui';
import type { Workbook } from '@univerjs/core';
import { createInternalEditorID, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { Input } from '@univerjs/design';

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
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const sheetId = workbook.getActiveSheet().getSheetId();

    const [readonly, setReadonly] = useState(false);

    return (
        <div
            style={containerStyle}
        >
            <TextEditor id={createInternalEditorID('test-editor-1')} placeholder="please input value" openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} isReadonly={readonly} style={editorStyle} canvasStyle={{ fontSize: 10 }} value="I found one cent on the roadside." />
            <br></br>
            <TextEditor id={createInternalEditorID('test-editor-2')} placeholder="please input value" openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} isReadonly={readonly} onlyInputFormula={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} />
            <br></br>
            <TextEditor id={createInternalEditorID('test-editor-3')} placeholder="please input value" openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} isReadonly={readonly} onlyInputRange={true} style={editorStyle} canvasStyle={{ fontSize: 10 }} />
            <br></br>
            <TextEditor id={createInternalEditorID('test-editor-4')} placeholder="please input value" openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} isReadonly={readonly} isSingle={false} onlyInputContent={true} style={{ ...editorStyle, height: '140px' }} canvasStyle={{ fontSize: 14 }} />
            <br></br>
            <RangeSelector placeholder="please input value" id={createInternalEditorID('test-rangeSelector-1')} width={280} openForSheetUnitId={unitId} isReadonly={readonly} openForSheetSubUnitId={sheetId} />
            <br></br>
            <RangeSelector placeholder="please input value" value="I am a wolf man" id={createInternalEditorID('test-rangeSelector-2')} isSingleChoice={true} isReadonly={readonly} openForSheetUnitId={unitId} openForSheetSubUnitId={sheetId} />
            <br></br>
            <Input placeholder="please input value" allowClear />
            <br></br>
            <button onClick={() => setReadonly(!readonly)}>{readonly === true ? 'enable' : 'disable'}</button>
        </div>
    );
};
