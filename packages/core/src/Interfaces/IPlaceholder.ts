import { PlaceholderType } from '../Enum/PlaceHolderType';

export interface IPlaceholder {
    type: PlaceholderType;
    index: number;
    parentObjectId: string;
}
