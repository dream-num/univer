import { FormulaDataType } from '@univerjs/base-formula-engine';

import { FormulaType } from '../Const/FunctionList';

export type IConfig = {};

// Types for props
export type IProps = { config: IConfig };

export interface IFormulaConfig {
    formulaData: FormulaDataType;
    calculationChain?: string[];
    recalculationMode?: RecalculationModeType;
}

export enum RecalculationModeType {
    AUTOMATIC = 'Automatic',
    MANUAL = 'Manual',
    AUTOMATIC_EXCEPT_TABLE = 'AutomaticExceptTable',
}

export interface Label {
    type?: string;
    locale?: string;
    label?: string;
    placeholderLocale?: string;
    placeholder?: string;
}

export interface ILabel extends Label {
    children?: Label[];
    onClick?: () => void;
}

export interface FunListILabel extends Label {
    children?: FormulaType[];
    onClick: (value: FormulaType) => void;
}

export interface FunParams {
    funParams: FormulaType;
}

export interface ICustomComponent {
    name?: string;
    props: {
        select?: Label[];
        funList?: FunListILabel;
        funParams?: FunParams;
        calcLocale?: string;
        range?: string;
        placeholderLocale?: string;
        titleLocale?: string;
        confirmTextLocale?: string;
    };
}

export interface SearchFormulaModalData {
    name: string;
    label?: FunParams;
    show?: boolean;
    mask?: boolean;
    group: ILabel[];
    titleLocale?: string;
    onCancel?: () => void;
    children: ICustomComponent;
    modal?: React.ReactNode; // 渲染的组件
}
