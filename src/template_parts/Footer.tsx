import { classArr } from "@/utils/classArr"
import { Container, Link, Text } from "@react-email/components"
import type { FooterV1Type } from "~/types/FooterV1Type"
import type { MayHaveClassName } from "../utils/MayHaveClassName"

export interface FooterProps extends FooterV1Type, MayHaveClassName {}

export default function Footer(p: FooterProps) {
  return (
    <Container className={classArr("pb-2 px-4 max-w-[600px]", p.className)}>
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
        {p.hompageSubtitle}
      </Text>
    </Container>
  )
}
