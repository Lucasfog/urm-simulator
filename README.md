# URM Simulator

Simulador visual de **URM (Unlimited Register Machine)**

O projeto permite montar programas URM em dois formatos:

- modo blocos (interface visual com drag and drop)
- modo texto (editor Monaco com validacao de sintaxe)

Tambem inclui execucao passo a passo, execucao continua com controle de velocidade, fita de registradores e destaque da instrucao ativa.

## Visao geral

A URM e um modelo teorico de computacao baseado em registradores naturais e instrucoes simples. Este simulador foi criado para estudo e experimentacao de programas URM, com foco em feedback visual durante a execucao.

## Funcionalidades

- editor em **modo blocos** para criar e reordenar instrucoes
- editor em **modo texto** com Monaco Editor
- validacao de sintaxe em tempo real no modo texto
- autocomplete para `z(n)`, `s(n)`, `t(m,n)` e `j(m,n,q)`
- controles de execucao: executar, pausar, passo unico e reiniciar
- ajuste de velocidade (ms por passo)
- exibicao de `PC`, total de passos e estado da maquina
- fita de registradores com destaque dos registradores tocados
- limite de seguranca de passos para evitar loop infinito (`MAX_STEPS = 800`)

## Instrucoes URM suportadas

- `Z(n)`: zera o registrador `R_n`
- `S(n)`: incrementa `R_n`
- `T(m,n)`: copia o valor de `R_m` para `R_n`
- `J(m,n,q)`: se `R_m = R_n`, salta para a linha `q`

No modo texto, use uma instrucao por linha, em minusculo ou maiusculo:

```txt
z(0)
s(0)
t(0,1)
j(1,2,6)
```