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

import type { Workbook } from '@univerjs/core';

import { createInternalEditorID, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { Input } from '@univerjs/design';
import { DocRangeSelector, TextEditor } from '@univerjs/docs-ui';
import React, { useState } from 'react';

const editorStyle: React.CSSProperties = {
    width: '100%',
};

/**
 * Floating editor's container.
 */
export const TestEditorContainer = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    if (workbook == null) {
        return;
    }

    const unitId = workbook.getUnitId();

    const sheetId = workbook.getActiveSheet()?.getSheetId();

    const [readonly, setReadonly] = useState(false);

    return (
        <div>
            <TextEditor
                id={createInternalEditorID('test-editor-1')}
                placeholder="please input value"
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={sheetId}
                isReadonly={readonly}
                style={editorStyle}
                canvasStyle={{ fontSize: 10 }}
                value="I found one cent on the roadside."
            />
            <br />
            <TextEditor
                id={createInternalEditorID('test-editor-2')}
                placeholder="please input value"
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={sheetId}
                isReadonly={readonly}
                onlyInputFormula
                style={editorStyle}
                canvasStyle={{ fontSize: 10 }}
            />
            <br />
            <TextEditor
                id={createInternalEditorID('test-editor-3')}
                placeholder="please input value"
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={sheetId}
                isReadonly={readonly}
                onlyInputRange
                style={editorStyle}
                canvasStyle={{ fontSize: 10 }}
            />
            <br />
            <TextEditor
                id={createInternalEditorID('test-editor-4')}
                placeholder="please input value"
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={sheetId}
                isReadonly={readonly}
                isSingle={false}
                onlyInputContent
                style={{ ...editorStyle, height: '140px' }}
                canvasStyle={{ fontSize: 14 }}
            />
            <br />
            <DocRangeSelector
                placeholder="please input value"
                id={createInternalEditorID('test-rangeSelector-1')}
                width={280}
                openForSheetUnitId={unitId}
                isReadonly={readonly}
                openForSheetSubUnitId={sheetId}
            />
            <br />
            <DocRangeSelector
                placeholder="please input value"
                value="I am a wolf man"
                id={createInternalEditorID('test-rangeSelector-2')}
                isSingleChoice
                isReadonly={readonly}
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={sheetId}
            />
            <br />
            <Input placeholder="please input value" allowClear />
            <br />
            <button type="button" onClick={() => setReadonly(!readonly)}>
                {readonly === true ? 'enable' : 'disable'}
            </button>
        </div>
    );
};
