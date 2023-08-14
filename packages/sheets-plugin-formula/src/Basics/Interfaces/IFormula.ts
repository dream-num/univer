import { FormulaDataType } from '@univerjs/base-formula-engine';

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
