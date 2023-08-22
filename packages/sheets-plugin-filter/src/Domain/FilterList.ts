import { GroupModel, Sequence, Serializer, Tools } from '@univerjs/core';
import { Filter } from './Filter';
import { IFilter } from '../IData/FilterType';

export interface IFilterPluginConfig extends Sequence {
    filters?: {
        [sheetId: string]: IFilter;
    };
}

export class FilterList extends Serializer implements GroupModel<{ [sheetId: string]: Filter }> {
    private _filters: {
        [sheetId: string]: Filter;
    };

    constructor() {
        super();
        this._filters = {};
    }

    static newInstance(sequence: IFilterPluginConfig): FilterList {
        const listModel = new FilterList();
        const filters = sequence.filters ?? {};
        for (const key in filters) {
            listModel._filters[key] = Filter.fromSequence(filters[key]);
        }
        return listModel;
    }

    addFilter(sheetId: string, filter: Filter): void {
        this._filters[sheetId] = filter;
    }

    getFilter(sheetId: string): Filter {
        return this._filters[sheetId];
    }

    removeFilter(sheetId: string): void {
        delete this._filters[sheetId];
    }

    getGroupModel(): { [sheetId: string]: Filter } {
        return this._filters;
    }

    override toSequence(): IFilterPluginConfig {
        const filters: {
            [sheetId: string]: IFilter;
        } = {};

        for (const key in this._filters) {
            filters[key] = this._filters[key].toSequence();
        }

        return {
            className: Tools.getClassName(this),
            filters,
        };
    }
}
