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

import type { Editor } from '@univerjs/docs-ui';
import { BuildTextUtils, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, LocaleService, RegionService } from '@univerjs/core';
import { getFormulaSyntax } from '@univerjs/engine-formula';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useLayoutEffect, useState } from 'react';
import { map, merge } from 'rxjs';

export function useCurrentFormulaSyntax() {
    const localeService = useDependency(LocaleService);
    const regionService = useDependency(RegionService);
    return useObservable(
        () => merge(regionService.currentRegion$, localeService.localeChanged$).pipe(
            map(() => getFormulaSyntax(regionService, localeService))
        ),
        undefined,
        true,
        [localeService, regionService]
    );
}

export function useFormulaEditorSyntax(editorId: string, editor: Editor | undefined, focused: boolean) {
    const current = useCurrentFormulaSyntax();
    const bridge = useDependency(IEditorBridgeService);
    const isCellEditor = editorId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY || editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
    const [embedded, setEmbedded] = useState(current);

    useLayoutEffect(() => {
        if (isCellEditor || focused || current === embedded) return;
        const draft = BuildTextUtils.transform.getPlainText(editor?.getDocumentData().body?.dataStream ?? '');
        const standard = embedded.toStandard(draft);
        if (standard === null) return;
        const local = current.toLocal(standard);
        if (local !== draft) editor?.replaceText(local, false);
        setEmbedded(current);
    }, [current, editor, embedded, focused, isCellEditor]);

    return isCellEditor ? bridge.getFormulaSyntax() : embedded;
}
