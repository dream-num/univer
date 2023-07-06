import {
    ITextRun,
    IParagraph,
    ISectionBreak,
    ICustomBlock,
    ITable,
    ICustomRange,
} from '../Interfaces';
import { Nullable } from '../Shared';

type CommonParameterAttribute = Nullable<
    ITextRun | IParagraph | ISectionBreak | ICustomBlock | ITable | ICustomRange
>;

export class CommonParameter {
    cursor: number;

    attributes: CommonParameterAttribute[] = [];

    reset() {
        this.cursor = 0;
        this.attributes = [];
        return this;
    }

    resetAttribute() {
        this.attributes = [];
    }

    addAttribute(attr: CommonParameterAttribute) {
        this.attributes.push(attr);
    }
}
