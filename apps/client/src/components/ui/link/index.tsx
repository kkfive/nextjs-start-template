import { isExternalLink } from '@/lib/utils'

import NextLink from 'next/link'

export function Link({ href = '#', ...rest }) {
  const isExternal = isExternalLink(href)
  if (isExternal) {
    return (
      <a
        href={`${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="link break-words after:content-['_↗']"
        {...rest}
      />
    )
  }

  return <NextLink href={href} className="link" {...rest} />
}
