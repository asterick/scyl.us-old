import { parse } from "./dynast.pegjs";

console.log(JSON.stringify(parse(`
struct SomeStruct {
	a:u32

	color: struct {
		r: f32
		g: f32
		b: f32
	}

	c:u32
}

export func a(b:u32, c:u32):s32 {
	def x:[5][5]*struct { a:u32 b:u32 c:u32 } = { 1 2 .c = 9 }

  	return x + -(c:s32)
}
`), null, 4));
