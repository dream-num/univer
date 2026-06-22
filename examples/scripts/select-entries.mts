import type { IDemoDefinition } from './sync-demos.mts';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { cancel, isCancel, multiselect } from '@clack/prompts';
import { discoverDemos, syncDemoArtifacts } from './sync-demos.mts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const SELECTION_FILE = path.resolve(EXAMPLES_ROOT, 'entry-selection.json');

export interface ISelectionFile {
    selected: string[];
    known: string[];
}

export interface ISelectionResult {
    entryPoints: string[];
    selectedDirs: string[];
}

export async function selectEntries(): Promise<ISelectionResult> {
    const demos = discoverDemos();

    if (!process.stdout.isTTY) {
        const { entryPoints } = syncDemoArtifacts();
        return {
            entryPoints,
            selectedDirs: demos.map((d) => d.dir),
        };
    }

    const saved = readSelection();
    const merged = mergeSelection(demos, saved);

    const selectedDirs = await promptSelection(demos, merged);
    writeSelection(selectedDirs, demos);

    const { entryPoints } = syncDemoArtifacts(selectedDirs);

    return { entryPoints, selectedDirs };
}

function readSelection(filePath = SELECTION_FILE): ISelectionFile | null {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        // Backward compat: old format was just an array of strings
        if (Array.isArray(parsed)) {
            return { selected: parsed.filter((item): item is string => typeof item === 'string'), known: [] };
        }
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.selected) && Array.isArray(parsed.known)) {
            return {
                selected: parsed.selected.filter((item: unknown): item is string => typeof item === 'string'),
                known: parsed.known.filter((item: unknown): item is string => typeof item === 'string'),
            };
        }
        return null;
    } catch {
        return null;
    }
}

export function mergeSelection(demos: IDemoDefinition[], saved: ISelectionFile | null): string[] {
    const currentDirs = new Set(demos.map((d) => d.dir));
    if (!saved) {
        return [...currentDirs].sort();
    }
    const selectedValid = saved.selected.filter((dir) => currentDirs.has(dir));
    const knownSet = new Set(saved.known);
    const merged = new Set(selectedValid);
    for (const dir of currentDirs) {
        if (!knownSet.has(dir)) {
            merged.add(dir); // new demo, default select
        }
    }
    return [...merged].sort();
}

async function promptSelection(demos: IDemoDefinition[], initial: string[]): Promise<string[]> {
    const options = demos.map((demo) => ({
        value: demo.dir,
        label: demo.title,
    }));

    const initialSet = new Set(initial);

    const result = await multiselect({
        message: 'Select demo entries to start (a: toggle all, space: select, enter: confirm, esc: cancel)',
        options,
        initialValues: options.filter((opt) => initialSet.has(opt.value)).map((opt) => opt.value),
    });

    if (isCancel(result)) {
        cancel('Operation cancelled');
        process.exit(0);
    }

    return result;
}

function writeSelection(selectedDirs: string[], demos: IDemoDefinition[]) {
    const file: ISelectionFile = {
        selected: selectedDirs,
        known: demos.map((d) => d.dir),
    };
    fs.writeFileSync(SELECTION_FILE, `${JSON.stringify(file, null, 4)}\n`);
}
