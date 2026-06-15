export type ResourceRefUnitType = 'sheet' | 'doc' | 'slide' | 'base';

export type ResourceRefFile =
    | { kind: 'self' }
    | { kind: 'relative'; path: string }
    | { kind: 'uri'; uri: string };

export interface ResourceRefUnit {
    selector: string;
    type: ResourceRefUnitType;
}

export type ResourceRefPart =
    | { kind: 'sheet'; sheetName: string; sheetId?: string }
    | { kind: 'range'; ref: string; sheetName: string; range: string; sheetId?: string };

export interface ResourceRef {
    file: ResourceRefFile;
    unit: ResourceRefUnit;
    part?: ResourceRefPart;
    extensions?: Record<string, string | readonly string[]>;
}
