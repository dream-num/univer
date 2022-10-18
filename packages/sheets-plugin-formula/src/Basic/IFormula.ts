import { Context } from '@univer/core';
import { FormulaDataType } from '@univer/base-formula-engine';

export type IConfig = {
    context: Context;
};

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
