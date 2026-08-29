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

import { clsx, resetButtonClassName } from '@univerjs/design';
import { MobileRichTextToolbar } from '@univerjs/docs-ui';
import { CheckMarkIcon, CloseIcon, DownIcon, FxIcon } from '@univerjs/icons';
import { MOBILE_FORMULA_OPERATOR_BAR_HEIGHT } from '../../../consts/mobile-context';

const FORMULA_OPERATORS = [
    { label: '+', value: '+' },
    { label: '−', value: '-' },
    { label: '×', value: '*' },
    { label: '÷', value: '/' },
    { label: '=', value: '=' },
    { label: '>', value: '>' },
    { label: '<', value: '<' },
    { label: ',', value: ',' },
    { label: ':', value: ':' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '&', value: '&' },
    { label: '!', value: '!' },
] as const;

interface IMobileFormulaBarOverlayProps {
    expanded: boolean;
    formulaActive: boolean;
    operatorsVisible: boolean;
    editorId: string;
    onOperator: (value: string) => void;
}

interface IMobileFormulaBarActionProps {
    expanded: boolean;
    cancelLabel: string;
    confirmLabel: string;
    formulaLabel: string;
    collapseLabel: string;
    onCancel: () => void;
    onConfirm: () => void;
    onFormula: () => void;
    onCollapse: () => void;
}

export function MobileFormulaBarOverlays(props: IMobileFormulaBarOverlayProps) {
    return (
        <>
            {props.operatorsVisible && (
                <div
                    className="
                      univer-absolute univer-inset-x-0 univer-bottom-full univer-z-20 univer-box-border univer-flex
                      univer-items-center univer-gap-0 univer-overflow-x-auto univer-bg-gray-0 univer-px-0
                      univer-shadow-[0_-4px_12px_rgba(0,0,0,0.08)]
                      dark:!univer-bg-gray-800
                    "
                    style={{ height: MOBILE_FORMULA_OPERATOR_BAR_HEIGHT, scrollbarWidth: 'none', touchAction: 'pan-x' }}
                >
                    {FORMULA_OPERATORS.map((operator) => (
                        <button
                            key={operator.label}
                            type="button"
                            aria-label={operator.label}
                            className="
                              univer-flex univer-size-8 univer-shrink-0 univer-appearance-none univer-items-center
                              univer-justify-center univer-rounded-lg univer-border-0 univer-bg-transparent univer-p-0
                              univer-text-base univer-font-medium univer-text-gray-800 univer-outline-none
                              active:univer-scale-95 active:univer-bg-primary-100 active:univer-text-primary-700
                              dark:!univer-text-gray-100
                              dark:active:!univer-bg-primary-900
                            "
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={() => props.onOperator(operator.value)}
                        >
                            {operator.label}
                        </button>
                    ))}
                </div>
            )}
            {props.expanded && !props.formulaActive && (
                <MobileRichTextToolbar
                    editorId={props.editorId}
                    className="univer-absolute univer-inset-x-0 univer-top-12 univer-z-20"
                />
            )}
        </>
    );
}

export function MobileFormulaBarActions(props: IMobileFormulaBarActionProps) {
    const actions = [
        { label: props.cancelLabel, icon: <CloseIcon />, onClick: props.onCancel, color: 'univer-text-red-600 dark:!univer-text-red-400' },
        { label: props.confirmLabel, icon: <CheckMarkIcon />, onClick: props.onConfirm, color: 'univer-text-green-600 dark:!univer-text-green-400' },
        { label: props.formulaLabel, icon: <FxIcon />, onClick: props.onFormula, color: 'univer-text-gray-700 dark:!univer-text-gray-100' },
    ];

    if (props.expanded) {
        actions.push({
            label: props.collapseLabel,
            icon: <DownIcon />,
            onClick: props.onCollapse,
            color: 'univer-text-gray-700 dark:!univer-text-gray-100',
        });
    }

    return (
        <div
            data-u-comp="formula-bar-actions"
            className={clsx(`
              univer-z-30 univer-bg-gray-0
              dark:!univer-bg-gray-800
            `, props.expanded
                ? `
                  univer-absolute univer-inset-x-0 univer-top-0 univer-grid univer-h-12 univer-grid-cols-4 univer-gap-1
                  univer-px-1
                `
                : `
                  univer-relative univer-box-border univer-flex univer-h-full univer-w-32 univer-items-center
                  univer-justify-center
                `)}
        >
            {actions.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    aria-label={action.label}
                    className={clsx(resetButtonClassName, `
                      univer-flex univer-h-full univer-flex-1 univer-items-center univer-justify-center
                      univer-rounded-lg univer-text-xl
                      active:univer-scale-95 active:univer-bg-gray-100
                      dark:active:!univer-bg-gray-700
                    `, action.color)}
                    onClick={action.onClick}
                >
                    {action.icon}
                </button>
            ))}
        </div>
    );
}
