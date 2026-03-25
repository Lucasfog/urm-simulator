import type { Op } from '../lib/urm'
import { Github, Moon, Sun } from 'lucide-react'
import type { Language } from '../lib/i18n'
import { toNonNegative } from '../lib/urm'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import type { ControlSidebarProps } from './types/control-sidebar.types'

const blockButtonsByLanguage: Record<Language, Array<{ op: Op; label: string; description: string }>> = {
  'pt-BR': [
    { op: 'Z', label: 'Z(n)', description: 'Zera registrador' },
    { op: 'S', label: 'S(n)', description: 'Incrementa registrador' },
    { op: 'T', label: 'T(m,n)', description: 'Transfere valor' },
    { op: 'J', label: 'J(m,n,q)', description: 'Salto condicional' },
  ],
  en: [
    { op: 'Z', label: 'Z(n)', description: 'Clear register' },
    { op: 'S', label: 'S(n)', description: 'Increment register' },
    { op: 'T', label: 'T(m,n)', description: 'Transfer value' },
    { op: 'J', label: 'J(m,n,q)', description: 'Conditional jump' },
  ],
}

export function ControlSidebar(props: ControlSidebarProps) {
  const {
    theme,
    language,
    initialRegisters,
    setInitialRegisters,
    onLoadRegisters,
    onAddInstruction,
    onToggleTheme,
    onLanguageChange,
  } = props

  const isPtBr = language === 'pt-BR'
  const blockButtons = blockButtonsByLanguage[language]

  return (
    <Card className="flex h-full flex-col min-w-0 rounded-none border-0 bg-transparent shadow-none">
      <CardHeader className="bg-card/40 pb-4 pt-6 lg:pt-8">
        <div className="flex items-center justify-between gap-2 pl-3 pr-3 lg:pl-4 lg:pr-4">
          <div className="flex h-14 w-14 items-center justify-center">
            <img src="/logo.png" alt="Logo URM" className="h-full w-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              URM Simulator
            </CardTitle>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {isPtBr ? 'Editor visual' : 'Visual editor'}
            </p>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              asChild
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full border-border/80 bg-card/90 text-foreground shadow-sm hover:bg-accent"
            >
              <a
                href="https://github.com/Lucasfog/urm-simulator"
                target="_blank"
                rel="noreferrer"
                aria-label={isPtBr ? 'Abrir repositorio no GitHub' : 'Open repository on GitHub'}
                title={isPtBr ? 'Abrir repositorio no GitHub' : 'Open repository on GitHub'}
              >
                <Github size={16} />
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              className="rounded-full border-border/80 bg-card/90 text-foreground shadow-sm hover:bg-accent"
              aria-label={
                theme === 'dark'
                  ? isPtBr
                    ? 'Ativar tema claro'
                    : 'Switch to light theme'
                  : isPtBr
                    ? 'Ativar tema escuro'
                    : 'Switch to dark theme'
              }
              title={
                theme === 'dark'
                  ? isPtBr
                    ? 'Ativar tema claro'
                    : 'Switch to light theme'
                  : isPtBr
                    ? 'Ativar tema escuro'
                    : 'Switch to dark theme'
              }
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6 px-4 lg:px-6 custom-scrollbar">
        <div className="rounded-xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur-sm dark:bg-card/70">
          <h3 className="mb-3 text-sm font-medium text-foreground">{isPtBr ? 'Idioma' : 'Language'}</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={language === 'pt-BR' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('pt-BR')}
              className="h-10 justify-center gap-2"
            >
              <span aria-hidden="true">🇧🇷</span>
              <span className="text-xs font-semibold">PT-BR</span>
            </Button>
            <Button
              type="button"
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => onLanguageChange('en')}
              className="h-10 justify-center gap-2"
            >
              <span aria-hidden="true">🇺🇸</span>
              <span className="text-xs font-semibold">EN</span>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-card/75 p-4 shadow-sm backdrop-blur-sm dark:bg-card/70">
          <h3 className="mb-3 text-sm font-medium text-foreground">
            {isPtBr ? 'Registradores iniciais' : 'Initial registers'}
          </h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-4">
            {initialRegisters.map((value, index) => (
              <label key={`initial-${index}`} className="group grid gap-1 relative">
                <span className="absolute -top-2 left-2 z-10 bg-background px-1 text-[10px] font-medium text-muted-foreground transition-colors group-focus-within:text-primary">
                  R{index}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={value}
                  className="h-10 border-border bg-background/85 px-2 text-center text-sm text-foreground shadow-inner transition-all focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary focus-visible:ring-primary"
                  onChange={(event) => {
                    const next = [...initialRegisters]
                    next[index] = toNonNegative(event.target.value)
                    setInitialRegisters(next)
                  }}
                />
              </label>
            ))}
          </div>

          <Button
            variant="default"
            className="mt-4 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_30%,transparent)] active:scale-[0.98]"
            onClick={onLoadRegisters}
          >
            {isPtBr ? 'Aplicar valores' : 'Apply values'}
          </Button>
        </div>

        <Separator className="bg-border/65" />

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            {isPtBr ? 'Blocos de Instrucao URM' : 'URM Instruction Blocks'}
          </h3>
          <div className="grid gap-2">
            {blockButtons.map((block) => (
              <button
                key={block.op}
                type="button"
                onClick={() => onAddInstruction(block.op)}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card/60 p-3 text-left transition-all hover:border-border/90 hover:bg-accent/45 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] transition-transform duration-500 group-hover:translate-x-[100%]"></div>
                <Badge 
                  variant="secondary" 
                  className={`pointer-events-none shrink-0 font-mono text-xs font-semibold shadow-sm
                    ${block.op === 'Z' ? 'bg-[#f14c4c]/12 text-[#a61b1b] border-[#f14c4c]/35 dark:bg-[#f14c4c]/15 dark:text-[#f14c4c]' : ''}
                    ${block.op === 'S' ? 'bg-[#4ec9b0]/12 text-[#0f766e] border-[#4ec9b0]/35 dark:bg-[#4ec9b0]/15 dark:text-[#4ec9b0]' : ''}
                    ${block.op === 'T' ? 'bg-[#569cd6]/12 text-[#1d4ed8] border-[#569cd6]/35 dark:bg-[#569cd6]/15 dark:text-[#569cd6]' : ''}
                    ${block.op === 'J' ? 'bg-[#c586c0]/12 text-[#7e22ce] border-[#c586c0]/35 dark:bg-[#c586c0]/15 dark:text-[#c586c0]' : ''}
                  `}
                >
                  {block.label}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {block.description}
                </span>
                <span className="ml-auto translate-x-2 transform text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  +
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 pb-2 sm:pt-8 opacity-60 transition-opacity hover:opacity-100">
          <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {isPtBr ? 'Desenvolvido por' : 'Developed by'}{' '}
            <a
              href="https://github.com/lucasfog"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-muted-foreground underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
            >
              Lucas Fogaça
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
