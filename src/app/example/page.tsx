import Link from 'next/link'

const examples = [
  {
    category: 'UI',
    items: [
      { name: 'Color Palette', href: '/example/color', description: 'Tailwind CSS color system demonstration' },
    ],
  },
  {
    category: 'Forms',
    items: [
      { name: 'Form Validation', href: '/example/form', description: 'react-hook-form + zod validation' },
    ],
  },
  {
    category: 'Data Fetching',
    items: [
      { name: 'Hitokoto API', href: '/example/request/hitokoto', description: 'External API request with ky' },
      { name: 'HTTP Request Examples', href: '/example/request-demo', description: 'Unified request handling with interceptors (success, business errors, HTTP errors)' },
    ],
  },
  {
    category: 'State Management',
    items: [
      { name: 'Zustand Store', href: '/example/zustand', description: 'Global state with Zustand' },
    ],
  },
]

export default function ExampleIndexPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Examples</h1>
      <p className="mb-8 text-zinc-600">
        Browse example implementations demonstrating various patterns and features.
      </p>

      <div className="space-y-8">
        {examples.map(category => (
          <section key={category.category}>
            <h2 className="mb-4 text-xl font-semibold text-zinc-800">{category.category}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {category.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h3 className="font-medium text-zinc-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
