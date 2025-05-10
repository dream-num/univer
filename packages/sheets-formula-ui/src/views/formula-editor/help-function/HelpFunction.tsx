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
import type { IFunctionParam } from '@univerjs/engine-formula';
import { LocaleService } from '@univerjs/core';
import { borderClassName, borderTopClassName, clsx } from '@univerjs/design';
import { CloseSingle, MoreSingle } from '@univerjs/icons';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { RectPopup, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useMemo, useState } from 'react';
import { generateParam } from '../../../services/utils';
import { useEditorPosition } from '../hooks/use-editor-position';
import { useFormulaDescribe } from '../hooks/use-formula-describe';
import { HelpHiddenTip } from './HelpHiddenTip';

interface IParamsProps {
    className?: string;
    title?: string;
    value?: string;
}

const Params = ({ className, title, value }: IParamsProps) => (
    <div className="univer-my-2">
        <div
            className={clsx(`
              univer-mb-2 univer-text-sm univer-font-medium univer-text-gray-900
              dark:univer-text-white
            `, className)}
        >
            {title}
        </div>
        <div
            className="univer-whitespace-pre-wrap univer-break-words univer-text-xs univer-text-gray-500"
        >
            {value}
        </div>
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
        <div>
            <span>
                {prefix}
                (
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    <span key={item.name}>
                        <span
                            className={active === i ? 'univer-text-primary-500' : ''}
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

interface IHelpFunctionProps {
    onParamsSwitch?: (index: number) => void;
    onClose?: () => void;
    editor: Editor;
    isFocus: boolean;
    formulaText: string;
};

const noop = () => { };
export function HelpFunction(props: IHelpFunctionProps) {
    const { onParamsSwitch = noop, onClose: propColose = noop, isFocus, editor, formulaText } = props;
    const { functionInfo, paramIndex, reset } = useFormulaDescribe(isFocus, formulaText, editor);
    const visible = useMemo(() => !!functionInfo && paramIndex >= 0, [functionInfo, paramIndex]);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const hidden = !useObservable(editorBridgeService.helpFunctionVisible$);
    const [contentVisible, setContentVisible] = useState(true);
    const localeService = useDependency(LocaleService);
    const required = localeService.t('formula.prompt.required');
    const optional = localeService.t('formula.prompt.optional');
    const editorId = editor.getEditorId();
    const [position$] = useEditorPosition(editorId, visible, [functionInfo, paramIndex]);
    function handleSwitchActive(paramIndex: number) {
        onParamsSwitch && onParamsSwitch(paramIndex);
    }

    const setHidden = useEvent((v: boolean) => {
        editorBridgeService.helpFunctionVisible$.next(!v);
    });

    const onClose = () => {
        setHidden(true);
        propColose();
    };

    return visible && functionInfo
        ? hidden
            ? (
                <RectPopup key="hidden" portal anchorRect$={position$} direction="left-center">
                    <HelpHiddenTip onClick={() => setHidden(false)} />
                </RectPopup>
            )
            : (
                <RectPopup key="show" portal onClickOutside={() => reset()} anchorRect$={position$} direction="vertical">
                    <div
                        className={clsx(`
                          univer-m-0 univer-box-border univer-w-[250px] univer-select-none univer-list-none
                          univer-rounded-lg univer-bg-white univer-leading-5 univer-shadow-md univer-outline-none
                        `, borderClassName)}
                    >
                        <div
                            className={clsx(`
                              univer-box-border univer-flex univer-items-center univer-justify-between univer-px-4
                              univer-py-3 univer-text-xs univer-font-medium univer-text-gray-900 univer-wrap-anywhere
                              dark:univer-text-white
                            `, borderTopClassName)}
                        >
                            <Help
                                prefix={functionInfo.functionName}
                                value={functionInfo.functionParameter}
                                active={paramIndex}
                                onClick={handleSwitchActive}
                            />
                            <div className="univer-flex">
                                <div
                                    className={`
                                      univer-ml-2 univer-flex univer-h-6 univer-w-6 univer-cursor-pointer
                                      univer-items-center univer-justify-center univer-rounded univer-bg-transparent
                                      univer-p-0 univer-text-xs univer-text-gray-500 univer-outline-none
                                      univer-transition-colors
                                      hover:univer-bg-gray-200
                                    `}
                                    style={{ transform: contentVisible ? 'rotateZ(-90deg)' : 'rotateZ(90deg)' }}
                                    onClick={() => setContentVisible(!contentVisible)}
                                >
                                    <MoreSingle />
                                </div>
                                <div
                                    className={`
                                      univer-ml-2 univer-flex univer-h-6 univer-w-6 univer-cursor-pointer
                                      univer-items-center univer-justify-center univer-rounded univer-bg-transparent
                                      univer-p-0 univer-text-xs univer-text-gray-600 univer-outline-none
                                      univer-transition-colors
                                      dark:univer-text-gray-200
                                      hover:univer-bg-gray-300
                                    `}
                                    onClick={onClose}
                                >
                                    <CloseSingle />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`
                              univer-box-border univer-max-h-[350px] univer-overflow-y-auto univer-px-4 univer-pb-3
                              univer-pt-0
                            `}
                            style={{
                                height: contentVisible ? 'unset' : 0,
                                padding: contentVisible ? 'revert-layer' : 0,
                            }}
                        >
                            <div className="univer-mt-3">
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
                                            className={paramIndex === i ? 'univer-text-primary-500' : ''}
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
