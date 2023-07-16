export type MyType = string | number;
export const test: MyType = 'hello ts';
export const test2: MyType = 4;
export function testfn1(par1: string) { console.log(par1) };
export const testfn2 = (par1: string) => console.log(par1);