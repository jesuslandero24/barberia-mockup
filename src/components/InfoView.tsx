import {
  ArrowRight,
  BellRing,
  BrainCircuit,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Database,
  MessageCircle,
} from "lucide-react";
import { infoPage } from "@/config/content";
import { ButtonLink } from "@/components/ButtonLink";

const stepIcons = {
  "1": CalendarCheck,
  "2": CalendarDays,
  "3": BellRing,
};

const paymentIcons = {
  "WhatsApp (Meta)": MessageCircle,
  "Inteligencia artificial (Anthropic)": BrainCircuit,
  "Página y base de datos": Database,
};

export function InfoView() {
  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="site-container">
          <span className="info-eyebrow" aria-hidden="true" />
          <h1 className="info-title">{infoPage.title}</h1>
          <p className="info-subtitle">{infoPage.subtitle}</p>

          <div className="info-steps">
            {infoPage.steps.map((step) => {
              const Icon = stepIcons[step.number];

              return (
                <article className="info-step" key={step.number}>
                  <span className="info-step-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <h2 className="info-step-title">
                      <span>{step.number}</span>
                      {step.title}
                    </h2>
                    <p className="info-copy">{step.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="info-blocks">
        <div className="site-container info-block-list">
          {infoPage.blocks.map((block) => (
            <details
              className="info-accordion"
              key={block.id}
              open={block.id === "costos"}
            >
              <summary className="info-accordion-summary">
                <span>{block.title}</span>
                <ChevronDown aria-hidden="true" className="info-chevron" />
              </summary>

              <div className="info-accordion-content">
                {block.id === "inteligencia-artificial" && (
                  <p className="info-copy">{block.text}</p>
                )}

                {block.id === "costos" && (
                  <>
                    <div className="info-cost-table-wrap">
                      <table className="info-cost-table">
                        <thead>
                          <tr>
                            {block.columns.map((column) => (
                              <th key={column} scope="col">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row) => (
                            <tr key={row[0]}>
                              {row.map((cell, index) => (
                                <td
                                  data-label={block.columns[index]}
                                  key={block.columns[index]}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="info-note">{block.note}</p>
                  </>
                )}

                {block.id === "ejemplo" && (
                  <>
                    <div className="info-example-grid">
                      {block.examples.map((example) => (
                        <article className="info-example-card" key={example.title}>
                          <h3 className="info-card-title">{example.title}</h3>
                          <ul className="info-example-rows">
                            {example.rows.map((row) => (
                              <li key={row}>{row}</li>
                            ))}
                          </ul>
                          <p className="info-example-total">{example.total}</p>
                        </article>
                      ))}
                    </div>
                    <p className="info-highlight">{block.highlight}</p>
                    <p className="info-note">{block.note}</p>
                  </>
                )}

                {block.id === "mas-citas" && (
                  <p className="info-copy">{block.text}</p>
                )}

                {block.id === "pagos" && (
                  <div className="info-payment-grid">
                    {block.paymentMethods.map((method) => {
                      const Icon = paymentIcons[method.title];

                      return (
                        <article className="info-payment-card" key={method.title}>
                          <span className="info-payment-icon" aria-hidden="true">
                            <Icon />
                          </span>
                          <div>
                            <h3 className="info-card-title">{method.title}</h3>
                            <p className="info-copy">{method.text}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {block.id === "datos" && (
                  <p className="info-copy">{block.text}</p>
                )}

                {block.id === "sin-whatsapp" && (
                  <p className="info-copy">{block.text}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="info-closing">
        <div className="site-container">
          <p className="info-note">{infoPage.closingNote}</p>
          <div className="info-closing-card">
            <span className="info-eyebrow" aria-hidden="true" />
            <p className="info-closing-text">{infoPage.closing}</p>
            <ButtonLink href="/reservar" className="info-cta">
              {infoPage.cta}
              <ArrowRight
                size={18}
                className="motion-arrow"
                aria-hidden="true"
              />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
