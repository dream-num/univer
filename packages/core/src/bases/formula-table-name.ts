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
type BaseFormulaSnapshot = { tables: Record<string, BaseFormulaTable> };

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

export function createBaseFormulaTableNameMap(snapshot: BaseFormulaSnapshot): ReadonlyMap<string, string> {
    const result = new Map<string, string>();
    const usedNames = new Set<string>();
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
        const formulaName = allocateBaseFormulaTableName(table.name, usedNames, table.formulaName);
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
    const validPreferredName = validBaseFormulaTableName(preferredName);
    if (validPreferredName && !usedNames.has(validPreferredName.toLowerCase())) {
        return validPreferredName;
    }

    const baseName = normalizeBaseFormulaTableName(displayName);
    let formulaName = baseName;
    let suffixNumber = 2;
    while (usedNames.has(formulaName.toLowerCase())) {
        const suffix = `_${suffixNumber++}`;
        formulaName = `${baseName.slice(0, 255 - suffix.length)}${suffix}`;
    }
    return formulaName;
}

export function getBaseFormulaTableName(
    table: BaseFormulaTable,
    snapshot: BaseFormulaSnapshot
): string {
    return createBaseFormulaTableNameMap(snapshot).get(table.id) ?? normalizeBaseFormulaTableName(table.name);
}

export function normalizeBaseFormulaTableReferences(formula: string, snapshot: BaseFormulaSnapshot): string {
    return rewriteFormulaTableAliases(formula, createBaseFormulaTableAliases(snapshot));
}

export function migrateBaseFormulaTableNames(snapshot: IBaseSnapshot): void {
    const formulaNames = createBaseFormulaTableNameMap(snapshot);
    const aliases = createBaseFormulaTableAliases(snapshot, formulaNames);
    for (const table of Object.values(snapshot.tables)) {
        table.formulaName = formulaNames.get(table.id) ?? normalizeBaseFormulaTableName(table.name);
    }
    for (const table of Object.values(snapshot.tables)) {
        for (const field of Object.values(table.fields)) {
            if (field.type !== 'formula' || typeof field.config?.formula !== 'string') continue;
            field.config.formula = rewriteFormulaTableAliases(field.config.formula, aliases);
        }
        for (const row of Object.values(table.cellData ?? {})) {
            for (const cell of Object.values(row ?? {})) {
                if (cell && typeof cell.f === 'string') {
                    cell.f = rewriteFormulaTableAliases(cell.f, aliases);
                }
            }
        }
    }
}

function createBaseFormulaTableAliases(
    snapshot: BaseFormulaSnapshot,
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

function createLegacyBaseFormulaTableNameMap(snapshot: BaseFormulaSnapshot): ReadonlyMap<string, string> {
    const result = new Map<string, string>();
    const usedNames = new Set<string>();
    const tables = Object.values(snapshot.tables).sort((left, right) => left.id.localeCompare(right.id));
    for (const table of tables) {
        const formulaName = allocateBaseFormulaTableName(table.name, usedNames);
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

function rewriteFormulaTableAliases(
    formula: string,
    aliases: ReadonlyArray<{ alias: string; formulaName: string }>
): string {
    let normalized = formula;
    for (const { alias, formulaName } of aliases) {
        normalized = rewriteFormulaTableAlias(normalized, alias, formulaName);
    }
    return normalized;
}

function createLegacyBaseFormulaTableName(tableId: string): string {
    const encoded = Array.from(tableId, (character) =>
        /[A-Za-z0-9]/.test(character) ? character : `_x${character.codePointAt(0)?.toString(16) ?? '0'}_`
    ).join('');
    return `_T_${encoded}`;
}

function rewriteFormulaTableAlias(formula: string, alias: string, formulaName: string): string {
    const lowerFormula = formula.toLowerCase();
    const lowerAlias = alias.toLowerCase();
    let result = '';
    let copiedUntil = 0;
    let searchFrom = 0;
    let changed = false;

    while (searchFrom < formula.length) {
        const offset = lowerFormula.indexOf(lowerAlias, searchFrom);
        if (offset < 0) break;
        let bracketOffset = offset + alias.length;
        while (/\s/.test(formula[bracketOffset] ?? '')) bracketOffset++;
        const previous = formula[offset - 1];
        const hasIdentifierPrefix = previous != null && /[A-Za-z0-9_.]/.test(previous);
        const isExternalReference = previous === '!';
        if (
            hasIdentifierPrefix
            || isExternalReference
            || formula[bracketOffset] !== '['
            || isInsideFormulaString(formula, offset)
        ) {
            searchFrom = offset + alias.length;
            continue;
        }
        result += formula.slice(copiedUntil, offset);
        result += formulaName;
        copiedUntil = offset + alias.length;
        searchFrom = bracketOffset + 1;
        changed = true;
    }
    return changed ? result + formula.slice(copiedUntil) : formula;
}

function isInsideFormulaString(formula: string, position: number): boolean {
    let inString = false;
    for (let index = 0; index < position; index++) {
        if (formula[index] !== '"') continue;
        if (inString && formula[index + 1] === '"') {
            index++;
            continue;
        }
        inString = !inString;
    }
    return inString;
}
