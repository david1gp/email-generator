import { Heading, Section, Text } from "@react-email/components"
import type { SecurityNotificationV1Type } from "../../../client/types/SecurityNotificationV1Type.js"
import { EmailLayout } from "../../template_parts/EmailLayout.js"
import { footerV1ExampleData } from "../../template_parts/footerV1ExampleData.js"

export function SecurityNotificationV1Template(p: SecurityNotificationV1Type) {
  const heading = p.heading ?? p.subject
  return (
    <EmailLayout
      l={p.l}
      preview={p.preview ?? p.subject}
      homepageText={p.homepageText}
      homepageUrl={p.homepageUrl}
      hompageSubtitle={p.hompageSubtitle}
      legalCompanySignature={p.legalCompanySignature}
    >
      <Heading className="text-2xl font-semibold mb-0">{heading}</Heading>
      {p.greeting === undefined ? null : <Text className="text-lg mb-1">{p.greeting}</Text>}
      <Text className="text-lg mb-1">{p.message}</Text>
      {p.details?.map((detail) => (
        <Section key={detail.label} className="mb-1">
          <Text className="text-sm mb-0">
            <strong>{detail.label}</strong>
          </Text>
          <Text className="text-sm mt-0">{detail.value}</Text>
        </Section>
      ))}
    </EmailLayout>
  )
}

SecurityNotificationV1Template.PreviewProps = {
  event: "impersonationStarted",
  subject: "Impersonation started",
  heading: "Impersonation started",
  message: "An administrator started acting as your account.",
  details: [{ label: "Session", value: "session-preview" }],
  ...footerV1ExampleData,
} as const satisfies SecurityNotificationV1Type

export default SecurityNotificationV1Template
