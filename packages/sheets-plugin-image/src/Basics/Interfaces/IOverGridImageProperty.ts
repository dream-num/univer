import { IPictureProps } from '@univerjs/base-render';

export enum OverGridImageBorderType {
    DASHED,
    SOLID,
    DOUBLE,
}

export interface IOverGridImageProperty extends IPictureProps {
    id: string;
    sheetId: string;
    radius: number;
    url: string;
    borderType: OverGridImageBorderType;
    width: number;
    height: number;
    row: number;
    column: number;
    borderColor: string;
    borderWidth: number;
}
