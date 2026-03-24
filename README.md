# URM Simulator

[Português (Brasil)](README.pt-BR.md)

![URM Simulator Logo](public/logo.png)

Visual **URM (Unlimited Register Machine)** simulator.

The project lets you build URM programs in two formats:

- block mode (visual drag-and-drop interface)
- text mode (Monaco editor with syntax validation)

It also includes step-by-step execution, continuous execution with speed control, register tape, and active instruction highlighting.

## Overview

URM is a theoretical computation model based on natural-number registers and simple instructions. This simulator was created for learning and experimentation, with a focus on visual feedback during execution.

## Features

- **block mode** editor to create and reorder instructions
- **text mode** editor with Monaco Editor
- real-time syntax validation in text mode
- autocomplete for `z(n)`, `s(n)`, `t(m,n)` and `j(m,n,q)`
- execution controls: run, pause, single step, and reset
- speed adjustment (ms per step)
- display of `PC`, total steps, and machine state
- register tape with highlighting for touched registers
- safety step limit to avoid infinite loops (`MAX_STEPS = 800`)

## Supported URM instructions

- `Z(n)`: resets register `R_n`
- `S(n)`: increments register `R_n`
- `T(m,n)`: copies `R_m` into `R_n`
- `J(m,n,q)`: if `R_m = R_n`, jumps to line `q`

In text mode, use one instruction per line (lowercase or uppercase):

```txt
z(0)
s(0)
t(0,1)
j(1,2,6)
```

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-change`
3. Commit your changes: `git commit -m "feat: add my change"`
4. Push the branch: `git push origin feat/my-change`
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.