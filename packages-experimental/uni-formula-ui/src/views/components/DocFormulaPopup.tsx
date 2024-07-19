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

import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useRef, useState } from 'react';
import clsx from 'clsx';
import { TextEditor } from '@univerjs/ui';
import type { IDocumentData, Nullable } from '@univerjs/core';
import { createInternalEditorID, DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentFlavor, ILogService, LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import type { IDocFormulaPopupInfo } from '../../services/formula-popup.service';
import { DOC_FORMULA_POPUP_KEY, DocFormulaPopupService } from '../../services/formula-popup.service';

import styles from './index.module.less';

export const DOCS_UNI_FORMULA_EDITOR_UNIT_ID_KEY = createInternalEditorID('UNI_FORMULA');
function makeSnapshot(f: string): IDocumentData {
    return {
        id: DOCS_UNI_FORMULA_EDITOR_UNIT_ID_KEY,
        body: {
            dataStream: `${f}${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [],
            paragraphs: [
                {
                    startIndex: 0,
                },
            ],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.MODERN,
        },
    };
}

export function DocFormulaPopup() {
    const docFormulaPopupService = useDependency(DocFormulaPopupService);
    const popupInfo = useObservable(docFormulaPopupService.popupInfo$);

    if (!popupInfo) {
        return null;
    }

    return <DocFormula popupInfo={popupInfo} />;
}

DocFormulaPopup.componentKey = DOC_FORMULA_POPUP_KEY;

function DocFormula(props: { popupInfo: IDocFormulaPopupInfo }) {
    const { popupInfo } = props;
    const { f } = popupInfo;

    const logService = useDependency(ILogService);
    const localeService = useDependency(LocaleService);
    const formulaPopupService = useDependency(DocFormulaPopupService);

    const [formulaString, setFormulaString] = useState<Nullable<string>>(f);
    const snapshotRef = useRef(makeSnapshot(f ?? ''));

    const [focused, setFocused] = useState(false);

    const onFormulaStringChange = (formulaString: Nullable<string>) => {
        setFormulaString(formulaString);
    };

    const onConfirm = useCallback(() => {
        formulaPopupService.writeFormulaString(formulaString);
    }, [formulaPopupService, formulaString]);

    const onCancel = useCallback(() => {
        formulaPopupService.cancel();
    }, [formulaPopupService]);

    return (
        <div className={styles.docUiFormulaPopup}>
            <span className={styles.docUiFormulaPopupTitle}>
                {popupInfo.type === 'new' ? localeService.t('uni-formula.popup.title.new') : localeService.t('uni-formula.popup.title.existing')}
            </span>

            {/* TODO: @wzhudev: add two buttons to confirm and leave formula editor. */}
            <TextEditor
                id={DOCS_UNI_FORMULA_EDITOR_UNIT_ID_KEY}
                className={clsx(styles.docUiFormulaPopupEditor, focused && styles.docUiFormulaPopupEditorActivated)}
                placeholder="Click here to insert formula..."
                snapshot={snapshotRef.current}
                cancelDefaultResizeListener
                isSheetEditor={false}
                isSingle={false}
                onChange={(str) => onFormulaStringChange(str)}
                onFocus={() => {
                    formulaPopupService.lockPopup();
                    setFocused(true);
                }} // TODO: @wzhudev show a hint to unlock by hitting a button
                onBlur={() => setFocused(false)}
            />

            <div className={styles.docUiFormulaPopupButtonGrp}>
                <Button type="primary" size="small" onClick={onConfirm}>{localeService.t('uni-formula.popup.button.confirm')}</Button>
                <Button type="default" size="small" onClick={onCancel}>{localeService.t('uni-formula.popup.button.cancel')}</Button>
            </div>
        </div>
    );
}
