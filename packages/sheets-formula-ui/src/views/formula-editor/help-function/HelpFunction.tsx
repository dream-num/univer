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

import type { IFunctionInfo, IFunctionParam } from '@univerjs/engine-formula';
import { LocaleService, useDependency } from '@univerjs/core';
import { CloseSingle, MoreSingle } from '@univerjs/icons';
import { RectPopup } from '@univerjs/ui';

import React, { useMemo, useState } from 'react';
import { generateParam } from '../../../services/utils';
import { useEditorPostion } from '../hooks/useEditorPostion';
import styles from './index.module.less';

interface IHelpFunctionProps {
    functionInfo?: IFunctionInfo;
    paramIndex: number;
    editorId: string;
    onParamsSwitch?: (index: number) => void;
    onClose?: () => void;
};
const noop = () => { };
export function HelpFunction(props: IHelpFunctionProps) {
    const { functionInfo, paramIndex, editorId, onParamsSwitch = noop, onClose = noop } = props;

    const visible = useMemo(() => !!functionInfo && paramIndex >= 0, [functionInfo, paramIndex]);
    const [contentVisible, setContentVisible] = useState(true);
    const localeService = useDependency(LocaleService);
    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');
    const [position$] = useEditorPostion(editorId, visible, [functionInfo, paramIndex]);

    function handleSwitchActive(paramIndex: number) {
        onParamsSwitch && onParamsSwitch(paramIndex);
    }

    return visible && functionInfo
        ? (
            <RectPopup anchorRect$={position$} direction="vertical">
                <div className={styles.formulaHelpFunction}>
                    <div className={styles.formulaHelpFunctionTitle}>
                        <Help
                            prefix={functionInfo.functionName}
                            value={functionInfo.functionParameter}
                            active={paramIndex}
                            onClick={handleSwitchActive}
                        />
                        <div className={styles.formulaHelpFunctionTitleIcons}>
                            <div
                                className={styles.formulaHelpFunctionTitleIcon}
                                style={{ transform: contentVisible ? 'rotateZ(-90deg)' : 'rotateZ(90deg)' }}
                                onClick={() => setContentVisible(!contentVisible)}
                            >
                                <MoreSingle />
                            </div>
                            <div
                                className={styles.formulaHelpFunctionTitleIcon}
                                onClick={onClose}
                            >
                                <CloseSingle />
                            </div>
                        </div>
                    </div>
                    <div
                        className={styles.formulaHelpFunctionContent}
                        style={{
                            height: contentVisible ? 'unset' : 0,
                            padding: contentVisible ? 'revert-layer' : 0,
                        }}
                    >
                        <div className={styles.formulaHelpFunctionContentInner}>
                            <Params
                                title={localeService.t('formula.prompt.helpExample')}
                                value={`${functionInfo.functionName}(${functionInfo.functionParameter
                                    .map((item) => item.example)
                                    .join(',')})`}
                            />
                            <Params
                                title={localeService.t('formula.prompt.helpAbstract')}
                                value={functionInfo.description}
                            />
                            {functionInfo &&
                                    functionInfo.functionParameter &&
                                    functionInfo.functionParameter.map((item: IFunctionParam, i: number) => (
                                        <Params
                                            key={i}
                                            className={paramIndex === i ? styles.formulaHelpFunctionActive : ''}
                                            title={item.name}
                                            value={`${item.require ? required : optional} ${item.detail}`}
                                        />
                                    ))}
                        </div>
                    </div>
                </div>
            </RectPopup>
        )
        : null;
}

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
}

const Params = (props: IParamsProps) => (
    <div className={styles.formulaHelpFunctionContentParams}>
        <div className={`
          ${styles.formulaHelpFunctionContentParamsTitle}
          ${props.className}
        `}
        >
            {props.title}
        </div>
        <div className={styles.formulaHelpFunctionContentParamsDetail}>{props.value}</div>
    </div>
);

interface IHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
    active: number;
    onClick: (paramIndex: number) => void;
}

const Help = (props: IHelpProps) => {
    const { prefix, value, active, onClick } = props;
    return (
        <div className={styles.formulaHelpParam}>
            <span className={styles.formulaHelpParamPrefix}>
                {prefix}
                (
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    // TODO@Dushusir: more params needs to be active
                    <span key={i} className={styles.formulaHelpParamItem}>
                        <span
                            className={active === i ? styles.formulaHelpFunctionActive : styles.formulaHelpParamActive}
                            onClick={() => onClick(i)}
                        >
                            {generateParam(item)}
                        </span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            )
        </div>
    );
};
