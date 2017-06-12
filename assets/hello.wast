(module
  (type $FUNCSIG$iii (func (param i32 i32) (result i32)))
  (table 0 anyfunc)
  (memory $0 1)
  (data (i32.const 12) "\00\00\00\00")
  (export "memory" (memory $0))
  (export "fac" (func $fac))
  (export "call" (func $call))
  (export "set_func" (func $set_func))
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
          (i32.const 2)
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
            (i32.const 2)
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
  (func $call (param $0 i32) (param $1 i32) (result i32)
    (call_indirect $FUNCSIG$iii
      (get_local $0)
      (get_local $1)
      (i32.load offset=12
        (i32.const 0)
      )
    )
  )
  (func $set_func (param $0 i32)
    (i32.store offset=12
      (i32.const 0)
      (get_local $0)
    )
  ) )
