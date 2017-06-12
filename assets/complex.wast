(module
  (type $FUNCSIG$iii (func (param i32 i32) (result i32)))
  (type $FUNCSIG$ii (func (param i32) (result i32)))
  (type $FUNCSIG$v (func))
  (import "env" "fib" (func $fib (param i32) (result i32)))
  (import "env" "remote" (global $remote i32))
  (import "env" "crazy" (func $crazy (param i32 i32) (result i32)))
  (table 6 6 anyfunc)
  (elem (i32.const 0) $__wasm_nullptr $add $sub $mul $div $__importThunk_crazy)
  (memory $0 1)
  (data (i32.const 12) "\00\00\00\00")
  (data (i32.const 16) "\01\00\00\00\02\00\00\00\03\00\00\00\04\00\00\00\05\00\00\00")
  (export "memory" (memory $0))
  (export "fac" (func $fac))
  (export "weird" (func $weird))
  (export "execute" (func $execute))
  (export "add" (func $add))
  (export "sub" (func $sub))
  (export "mul" (func $mul))
  (export "div" (func $div))
  (export "exec" (func $exec))
  (export "_GLOBAL__sub_I_10f23c89cb5f8f9a063c4f753d0443cd.cpp" (func $_GLOBAL__sub_I_10f23c89cb5f8f9a063c4f753d0443cd.cpp))
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
  (func $weird (param $0 i32) (param $1 i32) (result i32)
    (local $2 i32)
    (local $3 i32)
    (local $4 i32)
    (set_local $2
      (select
        (get_local $1)
        (get_local $0)
        (tee_local $3
          (i32.gt_s
            (get_local $0)
            (i32.const 0)
          )
        )
      )
    )
    (set_local $4
      (i32.const 1)
    )
    (block $label$0
      (br_if $label$0
        (i32.lt_s
          (tee_local $0
            (select
              (get_local $0)
              (get_local $1)
              (get_local $3)
            )
          )
          (i32.const 1)
        )
      )
      (set_local $4
        (i32.const 1)
      )
      (loop $label$1
        (set_local $4
          (i32.mul
            (get_local $4)
            (get_local $0)
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
    (i32.div_s
      (get_local $4)
      (call $fib
        (get_local $2)
      )
    )
  )
  (func $execute (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
    (local $3 i32)
    (local $4 i32)
    (local $5 i32)
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
              (br_table $label$4 $label$3 $label$2 $label$1 $label$4
                (get_local $0)
              )
            )
            (set_local $5
              (i32.const 1)
            )
            (i32.store offset=12
              (i32.const 0)
              (i32.add
                (i32.load offset=12
                  (i32.const 0)
                )
                (i32.const 1)
              )
            )
            (set_local $3
              (select
                (get_local $2)
                (get_local $1)
                (tee_local $0
                  (i32.gt_s
                    (get_local $1)
                    (i32.const 0)
                  )
                )
              )
            )
            (block $label$5
              (br_if $label$5
                (i32.lt_s
                  (tee_local $0
                    (select
                      (get_local $1)
                      (get_local $2)
                      (get_local $0)
                    )
                  )
                  (i32.const 1)
                )
              )
              (set_local $5
                (i32.const 1)
              )
              (loop $label$6
                (set_local $5
                  (i32.mul
                    (get_local $5)
                    (get_local $0)
                  )
                )
                (set_local $4
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
                (br_if $label$6
                  (get_local $4)
                )
              )
            )
            (set_local $1
              (i32.div_s
                (get_local $5)
                (call $fib
                  (get_local $3)
                )
              )
            )
          )
          (set_local $5
            (i32.const 1)
          )
          (i32.store offset=12
            (i32.const 0)
            (i32.add
              (i32.load offset=12
                (i32.const 0)
              )
              (i32.const 1)
            )
          )
          (set_local $3
            (select
              (get_local $2)
              (get_local $1)
              (tee_local $0
                (i32.gt_s
                  (get_local $1)
                  (i32.const 0)
                )
              )
            )
          )
          (block $label$7
            (br_if $label$7
              (i32.lt_s
                (tee_local $0
                  (select
                    (get_local $1)
                    (get_local $2)
                    (get_local $0)
                  )
                )
                (i32.const 1)
              )
            )
            (set_local $5
              (i32.const 1)
            )
            (loop $label$8
              (set_local $5
                (i32.mul
                  (get_local $5)
                  (get_local $0)
                )
              )
              (set_local $4
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
              (br_if $label$8
                (get_local $4)
              )
            )
          )
          (set_local $2
            (i32.div_s
              (get_local $5)
              (call $fib
                (get_local $3)
              )
            )
          )
        )
        (set_local $5
          (i32.const 1)
        )
        (i32.store offset=12
          (i32.const 0)
          (i32.add
            (i32.load offset=12
              (i32.const 0)
            )
            (i32.const 1)
          )
        )
        (set_local $3
          (select
            (get_local $1)
            (get_local $2)
            (tee_local $0
              (i32.gt_s
                (get_local $2)
                (i32.const 0)
              )
            )
          )
        )
        (block $label$9
          (br_if $label$9
            (i32.lt_s
              (tee_local $0
                (select
                  (get_local $2)
                  (get_local $1)
                  (get_local $0)
                )
              )
              (i32.const 1)
            )
          )
          (set_local $5
            (i32.const 1)
          )
          (loop $label$10
            (set_local $5
              (i32.mul
                (get_local $5)
                (get_local $0)
              )
            )
            (set_local $4
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
            (br_if $label$10
              (get_local $4)
            )
          )
        )
        (set_local $1
          (i32.div_s
            (get_local $5)
            (call $fib
              (get_local $3)
            )
          )
        )
      )
      (set_local $5
        (i32.const 1)
      )
      (i32.store offset=12
        (i32.const 0)
        (i32.add
          (i32.load offset=12
            (i32.const 0)
          )
          (i32.const 1)
        )
      )
      (set_local $3
        (select
          (get_local $1)
          (get_local $2)
          (tee_local $0
            (i32.gt_s
              (get_local $2)
              (i32.const 0)
            )
          )
        )
      )
      (block $label$11
        (br_if $label$11
          (i32.lt_s
            (tee_local $0
              (select
                (get_local $2)
                (get_local $1)
                (get_local $0)
              )
            )
            (i32.const 1)
          )
        )
        (set_local $5
          (i32.const 1)
        )
        (loop $label$12
          (set_local $5
            (i32.mul
              (get_local $5)
              (get_local $0)
            )
          )
          (set_local $4
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
          (br_if $label$12
            (get_local $4)
          )
        )
      )
      (set_local $2
        (i32.div_s
          (get_local $5)
          (call $fib
            (get_local $3)
          )
        )
      )
    )
    (i32.add
      (get_local $2)
      (get_local $1)
    )
  )
  (func $add (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (i32.add
      (get_local $1)
      (get_local $0)
    )
  )
  (func $sub (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (i32.sub
      (get_local $0)
      (get_local $1)
    )
  )
  (func $mul (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (i32.mul
      (get_local $1)
      (get_local $0)
    )
  )
  (func $div (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (i32.div_s
      (get_local $0)
      (get_local $1)
    )
  )
  (func $exec (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
    (call_indirect $FUNCSIG$iii
      (get_local $1)
      (get_local $2)
      (i32.load
        (i32.add
          (i32.shl
            (get_local $0)
            (i32.const 2)
          )
          (i32.const 16)
        )
      )
    )
  )
  (func $_GLOBAL__sub_I_10f23c89cb5f8f9a063c4f753d0443cd.cpp
    (i32.store offset=12
      (i32.const 0)
      (i32.shl
        (i32.load
          (get_global $remote)
        )
        (i32.const 2)
      )
    )
  )
  (func $__wasm_nullptr (type $FUNCSIG$v)
    (unreachable)
  )
  (func $__importThunk_crazy (type $FUNCSIG$iii) (param $0 i32) (param $1 i32) (result i32)
    (call $crazy
      (get_local $0)
      (get_local $1)
    )
  )
)
