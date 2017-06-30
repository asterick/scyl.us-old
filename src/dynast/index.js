import { parse } from "./dynast.pegjs";

console.log(parse(`
export func a(b:u32, c:u32):s32 {
  return s32: (b + c)
}
`));
