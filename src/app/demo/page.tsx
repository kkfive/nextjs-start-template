import { ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { demoNavConfig } from '@/config/demo-nav'

export default function DemoIndexPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-12 px-4 py-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Demo Examples</h1>
        <p className="text-lg text-neutral-600">
          Explore the features and capabilities of this Next.js template through interactive examples.
          Each demo showcases a specific feature with minimal, focused code.
        </p>
      </div>

      {/* How to Remove Demos */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-1 size-5 text-amber-700" />
          <div className="space-y-2">
            <h2 className="font-semibold text-amber-900">
              How to Remove Demo Code
            </h2>
            <p className="text-sm text-amber-800">
              When starting your project, you can safely delete all demo code by removing these directories:
            </p>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">src/app/demo/</code>
              </li>
              <li>
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">src/app/api/demo/</code>
              </li>
              <li>
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">domain/demo/</code>
              </li>
            </ul>
            <p className="text-sm text-amber-800">
              The core template will continue to work without any demo code.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Categories */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Browse by Category</h2>

        {demoNavConfig.map(category => (
          <div key={category.category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold">{category.category}</h3>
            </div>

            {/* Category Items */}
            <div className="grid gap-4 sm:grid-cols-2">
              {category.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-neutral-900 group-hover:text-blue-700">
                        {item.name}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="size-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Back to Home */}
      <div className="border-t border-neutral-200 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          ← Back to Homepage
        </Link>
      </div>
    </div>
  )
}
