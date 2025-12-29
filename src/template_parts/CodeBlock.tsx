import type { MayHaveClassName } from "@/utils/MayHaveClassName"

export interface CodeBlockProps extends MayHaveClassName {
  text: string
}

export function CodeBlock(p: CodeBlockProps) {
  return (
    <code className={p.className} style={codeStyle}>
      {p.text}
    </code>
  )
}

const codeStyle = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  fontSize: "24px",
  borderRadius: "4px",
  color: "#3c4149",
}
