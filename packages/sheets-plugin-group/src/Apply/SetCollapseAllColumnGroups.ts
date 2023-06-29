import { GroupOpenType, StructGroup } from '../Controller/StructGroup';

/**
 *
 * @param structGroup
 * @param openType
 *
 * @internal
 */
export function SetCollapseAllColumnGroups(structGroup: StructGroup, openType: GroupOpenType) {
    structGroup.setAllGroupOpenType(openType);
}
