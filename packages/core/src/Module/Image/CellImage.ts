import { CellImageBuilder } from './CellImageBuilder';

export class CellImage {
    constructor() {}

    getAltTextDescription(): string {
        return '';
    }

    getUrl(): string {
        return '';
    }

    getAltTextTitle(): string {
        return '';
    }

    getContentUrl(): string {
        return '';
    }

    toBuilder(): CellImageBuilder {
        return new CellImageBuilder();
    }
}
