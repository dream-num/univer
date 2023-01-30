import { GroupModel, Sequence, Serializer, Tools } from '@univerjs/core';
import { Filter, IFilter } from './Filter';

export interface IFilterPluginConfig extends Sequence {
    filters?: {
        [sheetId: string]: IFilter;
    };
}

export class FilterList extends Serializer implements GroupModel<{ [sheetId: string]: Filter }> {
    static newInstance(sequence: IFilterPluginConfig): FilterList {
        const listModel = new FilterList();
        const filters = sequence.filters ?? {};
        for (let key in filters) {
            listModel._filters[key] = Filter.fromSequence(filters[key]);
        }
        return listModel;
    }

    private _filters: {
        [sheetId: string]: Filter;
    };

    constructor() {
        super();
        this._filters = {};
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

    toSequence(): IFilterPluginConfig {
        let filters: {
            [sheetId: string]: IFilter;
        } = {};

        for (let key in this._filters) {
            filters[key] = this._filters[key].toSequence();
        }

        return {
            className: Tools.getClassName(this),
            filters,
        };
    }
}
