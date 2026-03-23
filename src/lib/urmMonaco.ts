import type * as Monaco from 'monaco-editor'

export const URM_LANGUAGE_ID = 'urm'

let languageInitialized = false

export function setupUrmLanguage(monaco: typeof Monaco): void {
  if (!languageInitialized) {
    monaco.languages.register({ id: URM_LANGUAGE_ID })

    monaco.languages.setMonarchTokensProvider(URM_LANGUAGE_ID, {
      tokenizer: {
        root: [
          [/\b[ZSTJzstj]\b/, 'keyword'],
          [/\d+/, 'number'],
          [/[,()]/, 'delimiter'],
          [/\s+/, 'white'],
        ],
      },
    })

    monaco.languages.setLanguageConfiguration(URM_LANGUAGE_ID, {
      brackets: [['(', ')']],
      autoClosingPairs: [{ open: '(', close: ')' }],
      surroundingPairs: [{ open: '(', close: ')' }],
    })

    monaco.languages.registerCompletionItemProvider(URM_LANGUAGE_ID, {
      triggerCharacters: ['z', 's', 't', 'j', 'Z', 'S', 'T', 'J'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        return {
        suggestions: [
          {
            label: 'z(n)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'z(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Zera registrador n',
            documentation: 'Instrucao Z(n)',
          },
          {
            label: 's(n)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 's(${1:0})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Incrementa registrador n',
            documentation: 'Instrucao S(n)',
          },
          {
            label: 't(m,n)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 't(${1:0},${2:1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Transfere Rm para Rn',
            documentation: 'Instrucao T(m,n)',
          },
          {
            label: 'j(m,n,q)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'j(${1:0},${2:1},${3:1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Se Rm = Rn, salta para linha q',
            documentation: 'Instrucao J(m,n,q)',
          },
        ],
      }
      },
    })

    languageInitialized = true
  }
}

function lineMarker(
  monaco: typeof Monaco,
  lineNumber: number,
  lineLength: number,
  message: string
): Monaco.editor.IMarkerData {
  return {
    severity: monaco.MarkerSeverity.Error,
    message,
    startLineNumber: lineNumber,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: Math.max(2, lineLength + 1),
  }
}

export function toUrmMarkers(
  input: string,
  monaco: typeof Monaco
): Monaco.editor.IMarkerData[] {
  const lines = input.split('\n')
  const markers: Monaco.editor.IMarkerData[] = []

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = rawLine.trim()

    if (!line) {
      return
    }

    const match = line.match(/^([zstj])\s*\((.*)\)$/i)
    if (!match) {
      markers.push(
        lineMarker(
          monaco,
          lineNumber,
          rawLine.length,
          'Formato invalido. Use z(0), s(1), t(1,2) ou j(1,2,6).'
        )
      )
      return
    }

    const op = match[1].toUpperCase()
    const args = match[2]
      .split(',')
      .map((arg) => arg.trim())
      .filter((arg) => arg.length > 0)

    const expected = op === 'J' ? 3 : op === 'T' ? 2 : 1
    if (args.length !== expected) {
      markers.push(
        lineMarker(
          monaco,
          lineNumber,
          rawLine.length,
          `${op} espera ${expected} argumento(s).`
        )
      )
      return
    }

    const values = args.map((arg) => Number(arg))
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      markers.push(
        lineMarker(
          monaco,
          lineNumber,
          rawLine.length,
          'Argumentos devem ser inteiros nao negativos.'
        )
      )
      return
    }

    if (op === 'J' && values[2] < 1) {
      markers.push(
        lineMarker(
          monaco,
          lineNumber,
          rawLine.length,
          'O destino q de J deve ser >= 1.'
        )
      )
    }
  })

  return markers
}