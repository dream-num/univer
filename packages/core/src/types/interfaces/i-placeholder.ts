import { PlaceholderType } from '../enum/place-holder-type';

export interface IPlaceholder {
    type: PlaceholderType;
    index: number;
    parentObjectId: string;
}
