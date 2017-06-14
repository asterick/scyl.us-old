import Module from "./module";
import { f32, f64, i32, i64 } from "./numbers";

/*** TESTBENCH ***/
var module = new Module();

module
	.function(i32("a"), i32("b"), i32("c"))
		.returns(i32)
		.export("SomeCall")
		.code((scope, a, b, c) => {
		})
	.start()
		.code((scope) => {
			scope.local(i64("farts"));
			scope.local(i32("farts"));
			console.log(scope);
		})

console.log(module);
