// eslint-disable-next-line node/prefer-global/process
export const IS_CI = !!process.env.CI;

export function generateSnapshotName(name: string): string {
    return IS_CI ? `${name}.ci.png` : `${name}.png`;
}
