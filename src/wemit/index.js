import Module from "./module";
import { f32, f64, u32, s32, u64, s64 } from "./numbers";

/*** TESTBENCH ***/
var module = new Module();

module
	.function(u32("a"), u32("b"), u32("c"))
		.returns(u32)
		.export("SomeCall")
		.code((scope, a, b, c) => {
		})
	.start()
		.if(u32(1), (scope) => {
			scope.return(s32(1).select(s32(1), 2));
		})
		.else((scope) => {
			// DO NOTHING
		});

console.log(module)