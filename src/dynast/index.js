import { parse } from "./dynast.pegjs";

console.log(JSON.stringify(parse(`
export func a(b:u32, c:u32):s32 {
  return s32: (b + -c)
}
`), null, 4));
