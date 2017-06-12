(module
  (type $FUNCSIG$ii (func (param i32) (result i32)))
  (type $FUNCSIG$iii (func (param i32 i32) (result i32)))
  (type $FUNCSIG$v (func))
  (import "env" "const_call" (func $const_call (param i32) (result i32)))
  (import "env" "this_call" (func $this_call (param i32 i32) (result i32)))
  (table 2 2 anyfunc)
  (elem (i32.const 0) $__wasm_nullptr $__importThunk_this_call)
  (memory $0 1)
  (data (i32.const 12) "\00\00\00\00")
  (data (i32.const 20) "\00\00\00\00")
  (data (i32.const 24) "\01\00\00\00")
  (data (i32.const 28) "\01\00\00\00\02\00\00\00\03\00\00\00")
  (export "memory" (memory $0))
  (export "fac" (func $fac))
  (export "example" (func $example))
  (export "switch_test" (func $switch_test))
  (export "_GLOBAL__sub_I_af839bf2d3bb3ea0be65d9eaaaf3a49c.cpp" (func $_GLOBAL__sub_I_af839bf2d3bb3ea0be65d9eaaaf3a49c.cpp))
  (func $fac (param $0 i32) (result i32)
    (local $1 i32)
    (local $2 i32)
    (set_local $2
      (i32.const 1)
    )
    (block $label$0
      (br_if $label$0
        (i32.lt_s
          (get_local $0)
          (i32.const 1)
        )
      )
      (set_local $2
        (i32.const 1)
      )
      (loop $label$1
        (set_local $2
          (i32.mul
            (get_local $0)
            (get_local $2)
          )
        )
        (set_local $1
          (i32.gt_s
            (get_local $0)
            (i32.const 1)
          )
        )
        (set_local $0
          (i32.add
            (get_local $0)
            (i32.const -1)
          )
        )
        (br_if $label$1
          (get_local $1)
        )
      )
    )
    (get_local $2)
  )
  (func $example (param $0 i32) (result i32)
    (i32.store offset=24
      (i32.const 0)
      (i32.load offset=12
        (i32.const 0)
      )
    )
    (i32.add
      (i32.load offset=16
        (i32.const 0)
      )
      (i32.load
        (i32.add
          (i32.shl
            (get_local $0)
            (i32.const 2)
          )
          (i32.const 28)
        )
      )
    )
  )
  (func $switch_test (param $0 i32) (result i32)
    (local $1 i32)
    (block $label$0
      (br_if $label$0
        (i32.gt_u
          (tee_local $0
            (i32.rotl
              (i32.add
                (get_local $0)
                (i32.const 1077936128)
              )
              (i32.const 30)
            )
          )
          (i32.const 3)
        )
      )
      (block $label$1
        (block $label$2
          (block $label$3
            (block $label$4
              (block $label$5
                (block $label$6
                  (block $label$7
                    (br_table $label$7 $label$6 $label$4 $label$2 $label$7
                      (get_local $0)
                    )
                  )
                  (i32.store offset=24
                    (i32.const 0)
                    (tee_local $0
                      (i32.load offset=12
                        (i32.const 0)
                      )
                    )
                  )
                  (i32.store offset=20
                    (i32.const 0)
                    (tee_local $1
                      (i32.add
                        (i32.load offset=20
                          (i32.const 0)
                        )
                        (i32.const 1)
                      )
                    )
                  )
                  (br $label$5)
                )
                (set_local $0
                  (i32.load offset=12
                    (i32.const 0)
                  )
                )
                (set_local $1
                  (i32.load offset=20
                    (i32.const 0)
                  )
                )
              )
              (i32.store offset=24
                (i32.const 0)
                (get_local $0)
              )
              (i32.store offset=20
                (i32.const 0)
                (tee_local $1
                  (i32.add
                    (get_local $1)
                    (i32.const 1)
                  )
                )
              )
              (br $label$3)
            )
            (set_local $0
              (i32.load offset=12
                (i32.const 0)
              )
            )
            (set_local $1
              (i32.load offset=20
                (i32.const 0)
              )
            )
          )
          (i32.store offset=24
            (i32.const 0)
            (get_local $0)
          )
          (i32.store offset=20
            (i32.const 0)
            (tee_local $1
              (i32.add
                (get_local $1)
                (i32.const 1)
              )
            )
          )
          (br $label$1)
        )
        (set_local $0
          (i32.load offset=12
            (i32.const 0)
          )
        )
        (set_local $1
          (i32.load offset=20
            (i32.const 0)
          )
        )
      )
      (i32.store offset=24
        (i32.const 0)
        (get_local $0)
      )
      (i32.store offset=20
        (i32.const 0)
        (i32.add
          (get_local $1)
          (i32.const 1)
        )
      )
    )
    (i32.const 0)
  )
  (func $_GLOBAL__sub_I_af839bf2d3bb3ea0be65d9eaaaf3a49c.cpp
    (i32.store offset=16
      (i32.const 0)
      (call $const_call
        (i32.const 32)
      )
    )
  )
  (func $__wasm_nullptr (type $FUNCSIG$v)
    (unreachable)
  )
  (func $__importThunk_this_call (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (call $this_call
      (get_local $0)
      (get_local $1)
    )
  )
)
