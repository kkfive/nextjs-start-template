import type { SiteFooterData, SiteFooterLink } from './site-footer-model'
import Link from 'next/link'
import { AtmosphereLayer } from './atmosphere/atmosphere-layer'
import { defaultSiteFooterData } from './site-footer-model'

type SiteFooterViewProps = {
  data: SiteFooterData
  className?: string
}

function FooterLink({ link }: { link: SiteFooterLink }) {
  return (
    <Link
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className="group flex min-h-11 flex-col items-start justify-center rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="link-underline">
        {link.label}
        {link.external ? ' ↗' : ''}
      </span>
      {link.description && <span className="mt-0.5 block text-xs text-muted-foreground/70">{link.description}</span>}
    </Link>
  )
}

export function SiteFooterView({ data, className = '' }: SiteFooterViewProps) {
  return (
    <footer className={`relative overflow-hidden rounded-4xl border border-border/70 bg-card/86 p-6 shadow-soft-sm sm:p-8 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      <AtmosphereLayer intensity="footer" gridInset="inset-x-[12%] top-[18%] bottom-[14%]" />
      <div className="relative grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-8">
        <section className="min-w-0">
          {data.brand.href
            ? <Link href={data.brand.href} className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight">{data.brand.name}</Link>
            : <h2 className="text-base font-semibold tracking-tight">{data.brand.name}</h2>}
          {data.brand.description && <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{data.brand.description}</p>}
        </section>

        {data.groups?.map(group => (
          <nav key={group.id} aria-label={group.title}>
            <h2 className="meta-mono mb-3 text-muted-foreground">{group.title}</h2>
            <div className="space-y-1">{group.links.map(link => <FooterLink key={`${group.id}-${link.href}-${link.label}`} link={link} />)}</div>
          </nav>
        ))}

        {data.friends && (
          <nav aria-label="友情链接">
            <h2 className="meta-mono mb-3 text-muted-foreground">友情链接</h2>
            <div className="space-y-1">{data.friends.map(link => <FooterLink key={`${link.href}-${link.label}`} link={link} />)}</div>
          </nav>
        )}

        {data.contacts && (
          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="meta-mono mb-3 text-muted-foreground">联系</h2>
            <address className="space-y-2 text-sm text-muted-foreground not-italic">
              {data.contacts.map(contact => (
                <p key={`${contact.label}-${contact.value}`}>
                  <span className="block text-xs text-muted-foreground/70">{contact.label}</span>
                  {contact.href ? <Link className="inline-flex min-h-11 items-center hover:text-foreground" href={contact.href}>{contact.value}</Link> : contact.value}
                </p>
              ))}
            </address>
          </section>
        )}
      </div>

      <div className="relative mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/50 pt-5 text-[11px] text-muted-foreground">
        <span>{data.copyright}</span>
        {data.compliance?.map(link => <FooterLink key={`${link.href}-${link.label}`} link={link} />)}
        <span className="ml-auto font-mono">{[data.version, data.build].filter(Boolean).join(' · ')}</span>
      </div>
    </footer>
  )
}

export function SiteFooter() {
  return (
    <div className="px-4 pt-10 pb-6 sm:px-6">
      <div className="mx-auto max-w-300">
        <SiteFooterView data={defaultSiteFooterData} />
      </div>
    </div>
  )
}
