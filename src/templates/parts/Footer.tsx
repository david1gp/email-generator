import { Link, Text } from "@react-email/components"
import type { MayHaveClassName } from "../../utils/MayHaveClassName"

// export const TemplateName = "ReactEmailFooter"
// export const TemplateStruct = v.object({})
// export type TemplateProps = v.InferOutput<typeof TemplateStruct>

export interface FooterProps extends MayHaveClassName {
  homepageText: string
  homepageUrl: string
  mottoText: string
}

export default function Footer(p: FooterProps) {
  return (
    <Text className={"mt-3 mb-6"}>
      <Link
        href={p.homepageUrl}
        className={"text-xl font-extrabold"}
        target={"_blank"}
        // style={{ color: "#898989" }}
      >
        {p.homepageText}
      </Link>
      <br />
      {p.mottoText}
    </Text>
  )
}
