import type { MayHaveClassName } from "@/utils/MayHaveClassName"
import { Link } from "@react-email/components"

export interface LinkButtonProps extends MayHaveClassName {
  url: string
  text: string
}

export function LinkButton(p: LinkButtonProps) {
  return (
    <Link href={p.url} style={buttonStyle} className={p.className}>
      {p.text}
    </Link>
  )
}

const buttonStyle = {
  backgroundColor: "#5e6ad2",
  borderRadius: "4px",
  fontWeight: "600",
  color: "#fff",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
}
