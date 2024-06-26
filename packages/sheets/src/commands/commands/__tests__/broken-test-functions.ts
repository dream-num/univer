import { IUniverInstanceService, Nullable, Workbook } from "@univerjs/core";
import { getSheetCommandTarget as realGetSheetCommandTarget } from "../utils/target-util"; 
import { createCommandTestBed } from "./create-command-test-bed"; 


export class TestData {
  static testData = new TestData();

  spoofed: boolean;

  constructor() {
    this.spoofed = false;
  }
}

export function getSheetCommandTarget(univerInstanceService: IUniverInstanceService) : Nullable<{workbook: Workbook, unitId: string}> {
  if (!TestData.testData.spoofed) {
    return realGetSheetCommandTarget(univerInstanceService);
  }

    const testBed = createCommandTestBed();

    univerInstanceService = testBed.get(IUniverInstanceService);
    return realGetSheetCommandTarget(univerInstanceService);
} 
