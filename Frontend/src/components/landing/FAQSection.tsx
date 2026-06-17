import { SectionReveal } from '../ui/section-reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { GlassCard } from '../ui/glass-card';

const faqs = [
  {
    q: 'How does WhatsApp integration work?',
    a: 'We connect your pharmacy to the official WhatsApp Business API as a Meta Tech Partner. Patients message your business number and our AI assistant handles responses automatically.',
  },
  {
    q: 'Is patient data secure?',
    a: 'Yes. BTBIZ is ISO 27001 certified. All data is encrypted in transit and at rest with enterprise-grade security controls.',
  },
  {
    q: 'Can I use my existing WhatsApp number?',
    a: 'In most cases, yes. We help migrate your existing business number to the WhatsApp Business API during onboarding.',
  },
  {
    q: 'Can multiple pharmacy branches use it?',
    a: 'Absolutely. Professional and Enterprise plans support multiple branches with centralized management and per-branch dashboards.',
  },
  {
    q: 'Do you provide onboarding support?',
    a: 'Yes. Our team provides full onboarding, training, and 24/7 support to ensure a smooth launch.',
  },
  {
    q: 'Is it customizable?',
    a: 'Yes. Bot flows, greetings, FAQs, and integrations can be customized to match your pharmacy workflow.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Frequently Asked Questions</h2>
        </SectionReveal>

        <SectionReveal className="mt-12">
          <GlassCard>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.q} value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}
