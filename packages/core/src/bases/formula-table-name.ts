/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IBaseSnapshot, ITableSnapshot } from './typedef';

type BaseFormulaTable = Pick<ITableSnapshot, 'id' | 'name' | 'formulaName'>;

interface IBaseFormulaSnapshot {
    tables: Record<string, BaseFormulaTable>;
}

interface ICompiledBaseFormulaTableAliases {
    formulaNameByAlias: ReadonlyMap<string, string>;
    pattern?: RegExp;
}

export function normalizeBaseFormulaTableName(displayName: string): string {
    const replaced = displayName.trim().replace(/[^A-Za-z0-9_.]+/g, '_');
    const normalized = /[A-Za-z0-9]/.test(replaced) ? replaced : 'Table';
    const prefixed = /^[A-Za-z_]/.test(normalized) ? normalized : `_${normalized}`;
    const nonReference = /^[RC]$/i.test(prefixed)
        || /^[A-Za-z]{1,3}[1-9]\d*$/.test(prefixed)
        || /^R(?:\d+)?C(?:\d+)?$/i.test(prefixed)
        ? `_${prefixed}`
        : prefixed;
    return nonReference.slice(0, 255);
}

export function createBaseFormulaTableNameMap(snapshot: IBaseFormulaSnapshot): ReadonlyMap<string, string> {
    const result = new Map<string, string>();
    const usedNames = new Set<string>();
    const nextSuffixByBaseName = new Map<string, number>();
    const tables = Object.values(snapshot.tables).sort((left, right) => left.id.localeCompare(right.id));

    // Persisted names own the namespace. Missing historical names are allocated only
    // after every valid persisted name has been reserved, so loading an old table can
    // never steal the stable formula identity of a newer table.
    for (const table of tables) {
        const formulaName = validBaseFormulaTableName(table.formulaName);
        if (!formulaName || usedNames.has(formulaName.toLowerCase())) continue;
        usedNames.add(formulaName.toLowerCase());
        result.set(table.id, formulaName);
    }

    for (const table of tables) {
        if (result.has(table.id)) continue;
        const formulaName = allocateBaseFormulaTableNameFromSet(
            table.name,
            usedNames,
            table.formulaName,
            nextSuffixByBaseName
        );
        usedNames.add(formulaName.toLowerCase());
        result.set(table.id, formulaName);
    }

    return result;
}

export function allocateBaseFormulaTableName(
    displayName: string,
    existingNames: Iterable<string>,
    preferredName?: string
): string {
    const usedNames = new Set(Array.from(existingNames, (name) => name.toLowerCase()));
    return allocateBaseFormulaTableNameFromSet(displayName, usedNames, preferredName);
}

function allocateBaseFormulaTableNameFromSet(
    displayName: string,
    usedNames: ReadonlySet<string>,
    preferredName?: string,
    nextSuffixByBaseName = new Map<string, number>()
): string {
    const validPreferredName = validBaseFormulaTableName(preferredName);
    if (validPreferredName && !usedNames.has(validPreferredName.toLowerCase())) {
        return validPreferredName;
    }

    const baseName = normalizeBaseFormulaTableName(displayName);
    const baseNameKey = baseName.toLowerCase();
    if (!usedNames.has(baseNameKey)) {
        return baseName;
    }

    let suffixNumber = nextSuffixByBaseName.get(baseNameKey) ?? 2;
    while (true) {
        const suffix = `_${suffixNumber++}`;
        const formulaName = `${baseName.slice(0, 255 - suffix.length)}${suffix}`;
        if (!usedNames.has(formulaName.toLowerCase())) {
            nextSuffixByBaseName.set(baseNameKey, suffixNumber);
            return formulaName;
        }
    }
}

export function getBaseFormulaTableName(
    table: BaseFormulaTable,
    snapshot: IBaseFormulaSnapshot
): string {
    return createBaseFormulaTableNameMap(snapshot).get(table.id) ?? normalizeBaseFormulaTableName(table.name);
}

export function normalizeBaseFormulaTableReferences(formula: string, snapshot: IBaseFormulaSnapshot): string {
    return createBaseFormulaTableReferenceNormalizer(snapshot)(formula);
}

export function createBaseFormulaTableReferenceNormalizer(
    snapshot: IBaseFormulaSnapshot,
    formulaNames = createBaseFormulaTableNameMap(snapshot)
): (formula: string) => string {
    const compiledAliases = compileBaseFormulaTableAliases(createBaseFormulaTableAliases(snapshot, formulaNames));
    return (formula) => rewriteFormulaTableAliases(formula, compiledAliases);
}

export function migrateBaseFormulaTableNames(snapshot: IBaseSnapshot): void {
    const formulaNames = createBaseFormulaTableNameMap(snapshot);
    const normalizeReferences = createBaseFormulaTableReferenceNormalizer(snapshot, formulaNames);
    for (const table of Object.values(snapshot.tables)) {
        table.formulaName = formulaNames.get(table.id) ?? normalizeBaseFormulaTableName(table.name);
    }
    for (const table of Object.values(snapshot.tables)) {
        for (const field of Object.values(table.fields)) {
            if (field.type !== 'formula' || typeof field.config?.formula !== 'string') continue;
            field.config.formula = normalizeReferences(field.config.formula);
        }
        for (const row of Object.values(table.cellData ?? {})) {
            for (const cell of Object.values(row ?? {})) {
                if (cell && typeof cell.f === 'string') {
                    cell.f = normalizeReferences(cell.f);
                }
            }
        }
    }
}

function createBaseFormulaTableAliases(
    snapshot: IBaseFormulaSnapshot,
    formulaNames = createBaseFormulaTableNameMap(snapshot)
): Array<{ alias: string; formulaName: string }> {
    const legacyFormulaNames = createLegacyBaseFormulaTableNameMap(snapshot);
    const formulaNameOwners = new Map(
        Array.from(formulaNames, ([tableId, formulaName]) => [formulaName.toLowerCase(), tableId])
    );
    const displayNameCounts = new Map<string, number>();
    for (const table of Object.values(snapshot.tables)) {
        const key = table.name.toLowerCase();
        displayNameCounts.set(key, (displayNameCounts.get(key) ?? 0) + 1);
    }
    return Object.values(snapshot.tables)
        .flatMap((table) => {
            const formulaName = formulaNames.get(table.id) ?? normalizeBaseFormulaTableName(table.name);
            const inputAliases = [
                table.id,
                createLegacyBaseFormulaTableName(table.id),
                legacyFormulaNames.get(table.id),
                table.formulaName,
            ];
            if (displayNameCounts.get(table.name.toLowerCase()) === 1) {
                inputAliases.push(table.name);
            }
            return inputAliases
                .filter((alias): alias is string => Boolean(alias))
                .flatMap((alias) => [alias, quoteBaseFormulaTableAlias(alias)])
                .filter((alias): alias is string => Boolean(alias))
                .filter((alias) => alias.toLowerCase() !== formulaName.toLowerCase())
                .filter((alias) => {
                    const owner = formulaNameOwners.get(unquoteBaseFormulaTableAlias(alias).toLowerCase());
                    return owner == null || owner === table.id;
                })
                .map((alias) => ({ alias, formulaName }));
        })
        .sort((left, right) => right.alias.length - left.alias.length);
}

function createLegacyBaseFormulaTableNameMap(snapshot: IBaseFormulaSnapshot): ReadonlyMap<string, string> {
    const result = new Map<string, string>();
    const usedNames = new Set<string>();
    const nextSuffixByBaseName = new Map<string, number>();
    const tables = Object.values(snapshot.tables).sort((left, right) => left.id.localeCompare(right.id));
    for (const table of tables) {
        const formulaName = allocateBaseFormulaTableNameFromSet(
            table.name,
            usedNames,
            undefined,
            nextSuffixByBaseName
        );
        usedNames.add(formulaName.toLowerCase());
        result.set(table.id, formulaName);
    }
    return result;
}

function validBaseFormulaTableName(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed && normalizeBaseFormulaTableName(trimmed) === trimmed ? trimmed : undefined;
}

function quoteBaseFormulaTableAlias(alias: string): string | undefined {
    return /[^A-Za-z0-9_.]/.test(alias) ? `'${alias.replaceAll("'", "''")}'` : undefined;
}

function unquoteBaseFormulaTableAlias(alias: string): string {
    return alias.startsWith("'") && alias.endsWith("'")
        ? alias.slice(1, -1).replaceAll("''", "'")
        : alias;
}

function compileBaseFormulaTableAliases(
    aliases: ReadonlyArray<{ alias: string; formulaName: string }>
): ICompiledBaseFormulaTableAliases {
    const formulaNameByAlias = new Map<string, string>();
    for (const { alias, formulaName } of aliases) {
        const key = alias.toLowerCase();
        if (!formulaNameByAlias.has(key)) {
            formulaNameByAlias.set(key, formulaName);
        }
    }
    const orderedAliases = Array.from(formulaNameByAlias.keys()).sort((left, right) => right.length - left.length);
    return {
        formulaNameByAlias,
        pattern: orderedAliases.length ? new RegExp(`(${orderedAliases.map(escapeRegExp).join('|')})(\\s*)\\[`, 'gi') : undefined,
    };
}

function createLegacyBaseFormulaTableName(tableId: string): string {
    const encoded = Array.from(tableId, (character) => /[A-Za-z0-9]/.test(character) ? character : `_x${character.codePointAt(0)?.toString(16) ?? '0'}_`).join('');
    return `_T_${encoded}`;
}

function rewriteFormulaTableAliases(
    formula: string,
    aliases: ICompiledBaseFormulaTableAliases
): string {
    if (!aliases.pattern) return formula;

    let scannedUntil = 0;
    let inString = false;
    aliases.pattern.lastIndex = 0;
    return formula.replace(
        aliases.pattern,
        (match: string, alias: string, whitespace: string, offset: number) => {
            inString = scanFormulaStringState(formula, scannedUntil, offset, inString);
            scannedUntil = offset;
            const previous = formula[offset - 1];
            const hasIdentifierPrefix = previous != null && /[A-Za-z0-9_.]/.test(previous);
            const isExternalReference = previous === '!';
            if (hasIdentifierPrefix || isExternalReference || inString) {
                return match;
            }
            const formulaName = aliases.formulaNameByAlias.get(alias.toLowerCase());
            return formulaName ? `${formulaName}${whitespace}[` : match;
        }
    );
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scanFormulaStringState(formula: string, start: number, end: number, initialState: boolean): boolean {
    let inString = initialState;
    for (let index = start; index < end; index++) {
        if (formula[index] !== '"') continue;
        if (inString && formula[index + 1] === '"') {
            index++;
            continue;
        }
        inString = !inString;
    }
    return inString;
}
