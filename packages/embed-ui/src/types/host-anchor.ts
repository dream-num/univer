import type { EmbedHostEntry } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';

export type EmbedHostAnchorKind =
    | 'docs-custom-block'
    | 'sheets-floating-object'
    | 'sheets-sheet-tab'
    | 'bases-table-list-block'
    | 'slides-floating-object'
    | 'slides-page-list-block';

export interface EmbedHostAnchorRecord {
    hostAnchorId: string;
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    kind: EmbedHostAnchorKind;
    hostContext?: Record<string, unknown>;
    lifecycle?: 'active' | 'removed';
    createdAt?: number;
    updatedAt?: number;
}
