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

def color:struct { r:u32 g:u32 b:u32 } = { 0 1 2 }
def otherThing:SomeStruct

export func a(b:u32, c:u32):s32 {
    otherThing.color = {
    	.r = color.r
    	.g = color.g
    	.b = color.b
    }

  	return x + -(c:s32)
}
`), null, 4));
