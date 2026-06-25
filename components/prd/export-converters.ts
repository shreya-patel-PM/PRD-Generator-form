// Converts the generated Markdown PRD into Confluence wiki markup.
// Handles headers, bold, bullet/numbered lists, tables, horizontal rules,
// and blockquotes — the subset the PRD generator actually emits.
export function markdownToConfluence(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Table: a header row followed by a separator row of dashes.
    const isTableRow = /^\s*\|(.+)\|\s*$/.test(line)
    const next = lines[i + 1] ?? ''
    const isSeparator = /^\s*\|?[\s:|-]+\|?\s*$/.test(next) && next.includes('-')
    if (isTableRow && isSeparator) {
      // Header row -> ||a||b||
      const headerCells = splitRow(line)
      out.push('||' + headerCells.map((c) => convertInline(c)).join('||') + '||')
      i += 2 // skip header + separator
      // Body rows
      while (i < lines.length && /^\s*\|(.+)\|\s*$/.test(lines[i])) {
        const cells = splitRow(lines[i])
        out.push('|' + cells.map((c) => convertInline(c)).join('|') + '|')
        i += 1
      }
      continue
    }

    out.push(convertLine(line))
    i += 1
  }

  return out.join('\n')
}

function splitRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function convertLine(line: string): string {
  // Horizontal rule
  if (/^\s*---+\s*$/.test(line)) return '----'

  // Headers (h1-h6 -> hN.)
  const header = /^(#{1,6})\s+(.*)$/.exec(line)
  if (header) {
    const level = header[1].length
    return `h${level}. ${convertInline(header[2])}`
  }

  // Blockquote
  const quote = /^\s*>\s?(.*)$/.exec(line)
  if (quote) return `{quote}${convertInline(quote[1])}{quote}`

  // Numbered list -> '# '
  const numbered = /^(\s*)\d+\.\s+(.*)$/.exec(line)
  if (numbered) {
    const depth = Math.floor(numbered[1].length / 2) + 1
    return `${'#'.repeat(depth)} ${convertInline(numbered[2])}`
  }

  // Bullet list -> '* '
  const bullet = /^(\s*)[-*+]\s+(.*)$/.exec(line)
  if (bullet) {
    const depth = Math.floor(bullet[1].length / 2) + 1
    return `${'*'.repeat(depth)} ${convertInline(bullet[2])}`
  }

  return convertInline(line)
}

// Inline conversions: bold (**x** / __x__ -> *x*), italics (*x* -> _x_),
// inline code (`x` -> {{x}}), links ([t](u) -> [t|u]).
function convertInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '{{$1}}')
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .replace(/__([^_]+)__/g, '*$1*')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]')
}
