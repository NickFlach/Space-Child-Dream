declare module 'circomlibjs' {
  export function buildPoseidon(): Promise<{
    F: {
      toString(value: any): string;
    };
    (inputs: bigint[]): any;
  }>;
  
  export function buildBabyjub(): Promise<any>;
  export function buildEddsa(): Promise<any>;
  export function buildMimc7(): Promise<any>;
  export function buildMimcsponge(): Promise<any>;
}
