import { BorderType, NormalType } from '../Enum';

export type IProps = {
    normal: NormalType;
    fixed: boolean;
    borderStyle: BorderType;
    borderWidth: number;
    borderRadius: number;
    borderColor: string;
};
