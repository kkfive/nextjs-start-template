import { Controller } from '@domain/example/request/controller'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { ClientScenarioCard } from '@/components/demo/request/client-scenario-card'
import { ScenarioCard } from '@/components/domain/request/scenario-card'
import { httpTo } from '@/lib/utils'
import { httpServer } from '@/service/index.server'

// Force dynamic rendering to ensure cookies() is called within request context
export const dynamic = 'force-dynamic'

export default async function HttpErrorsPage() {
  const [error404Err, error404Data] = await httpTo(
    Controller.rawScenario(httpServer, 'error-404'),
  )
  const [error500Err, error500Data] = await httpTo(
    Controller.rawScenario(httpServer, 'error-500'),
  )
  const [error503Err, error503Data] = await httpTo(
    Controller.rawScenario(httpServer, 'error-503'),
  )

  return (
    <DemoWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Demonstrating HTTP error status codes (404, 500, 503)
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server-Side 404 Error"
            description="Resource not found on server"
            method="GET"
            endpoint="/api/example/request/error/404"
            mode="server"
            initialData={error404Data || error404Err}
            expectedStatus="http-error"
          />
          <ClientScenarioCard
            title="Client-Side 404 Error"
            description="Click to trigger 404 error from client"
            method="GET"
            endpoint="/api/example/request/error/404"
            scenario="error-404"
            expectedStatus="http-error"
          />
          <ScenarioCard
            title="Server-Side 500 Error"
            description="Internal server error on server"
            method="GET"
            endpoint="/api/example/request/error/500"
            mode="server"
            initialData={error500Data || error500Err}
            expectedStatus="http-error"
          />
          <ClientScenarioCard
            title="Client-Side 500 Error"
            description="Click to trigger 500 error from client"
            method="GET"
            endpoint="/api/example/request/error/500"
            scenario="error-500"
            expectedStatus="http-error"
          />
          <ScenarioCard
            title="Server-Side 503 Error"
            description="Service unavailable on server"
            method="GET"
            endpoint="/api/example/request/error/503"
            mode="server"
            initialData={error503Data || error503Err}
            expectedStatus="http-error"
          />
          <ClientScenarioCard
            title="Client-Side 503 Error"
            description="Click to trigger 503 error from client"
            method="GET"
            endpoint="/api/example/request/error/503"
            scenario="error-503"
            expectedStatus="http-error"
          />
        </div>
      </div>
    </DemoWrapper>
  )
}
