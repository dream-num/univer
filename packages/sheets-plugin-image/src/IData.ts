import { BorderType } from './Enum/BorderType';
import { NormalType } from './Enum/NormalType';

export type IProps = {
    normal: NormalType;
    fixed: boolean;
    borderStyle: BorderType;
    borderWidth: number;
    borderRadius: number;
    borderColor: string;
};
