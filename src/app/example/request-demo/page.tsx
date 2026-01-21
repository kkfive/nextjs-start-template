import { ScenarioCard } from '@domain/example/request/components/scenario-card'
import { Controller } from '@domain/example/request/controller'
import { httpTo } from '@/lib/utils'
import { httpServer } from '@/service/index.server'
import { ClientScenarioCard } from './client-scenario-card'
import { InterceptedClientCard } from './intercepted-client-card'

export default async function RequestDemoPage() {
  // Interceptor applied: returns data directly or throws BusinessError
  const [interceptedSuccessErr, interceptedSuccessData] = await httpTo(
    Controller.unifiedScenario(httpServer, 'success'),
  )
  const [interceptedBusinessErr, interceptedBusinessData] = await httpTo(
    Controller.unifiedScenario(httpServer, 'business-error'),
  )

  // Raw response: returns full response object
  const [successErr, successData] = await httpTo(
    Controller.rawScenario(httpServer, 'success'),
  )
  const [businessErr, businessData] = await httpTo(
    Controller.rawScenario(httpServer, 'business-error'),
  )
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
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">HTTP Request Examples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstrating unified request handling across server and client components
        </p>
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Interceptor Applied (Recommended)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Using
            {' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">unifiedScenario</code>
            {' '}
            - Success returns data directly, errors throw BusinessError
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server: Success → Data Only"
            description="Interceptor extracts data field from response"
            method="GET"
            endpoint="/api/example/request/success"
            mode="server"
            initialData={interceptedSuccessData || interceptedSuccessErr}
            expectedStatus="success"
          />
          <InterceptedClientCard
            title="Client: Success → Data Only"
            description="Click to see interceptor extract data field"
            method="GET"
            endpoint="/api/example/request/success"
            scenario="success"
            expectedStatus="success"
          />
          <ScenarioCard
            title="Server: Business Error → BusinessError"
            description="Interceptor converts to BusinessError object"
            method="POST"
            endpoint="/api/example/request/scenario"
            mode="server"
            initialData={interceptedBusinessData || interceptedBusinessErr}
            expectedStatus="business-error"
          />
          <InterceptedClientCard
            title="Client: Business Error → BusinessError"
            description="Click to see interceptor convert to BusinessError"
            method="POST"
            endpoint="/api/example/request/scenario"
            scenario="business-error"
            expectedStatus="business-error"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Raw Response (No Interceptor)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Using
            {' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">rawScenario</code>
            {' '}
            - Returns full response envelope
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server: Success → Full Envelope"
            description="Returns complete response with success, data, code, message"
            method="GET"
            endpoint="/api/example/request/success"
            mode="server"
            initialData={successData || successErr}
            expectedStatus="success"
          />
          <ClientScenarioCard
            title="Client: Success → Full Envelope"
            description="Click to see complete response envelope"
            method="GET"
            endpoint="/api/example/request/success"
            scenario="success"
            expectedStatus="success"
          />
          <ScenarioCard
            title="Server: Business Error → Full Envelope"
            description="Returns complete error response with all fields"
            method="POST"
            endpoint="/api/example/request/scenario"
            mode="server"
            initialData={businessData || businessErr}
            expectedStatus="business-error"
          />
          <ClientScenarioCard
            title="Client: Business Error → Full Envelope"
            description="Click to see complete error envelope"
            method="POST"
            endpoint="/api/example/request/scenario"
            scenario="business-error"
            expectedStatus="business-error"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Success Scenarios</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server-Side Success"
            description="Data fetched during server-side rendering"
            method="GET"
            endpoint="/api/example/request/success"
            mode="server"
            initialData={successData || successErr}
            expectedStatus="success"
          />
          <ClientScenarioCard
            title="Client-Side Success"
            description="Click to fetch data from the client"
            method="GET"
            endpoint="/api/example/request/success"
            scenario="success"
            expectedStatus="success"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Business Errors</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server-Side Business Error"
            description="Business logic error handled on server"
            method="POST"
            endpoint="/api/example/request/scenario"
            mode="server"
            initialData={businessData || businessErr}
            expectedStatus="business-error"
          />
          <ClientScenarioCard
            title="Client-Side Business Error"
            description="Click to trigger business error from client"
            method="POST"
            endpoint="/api/example/request/scenario"
            scenario="business-error"
            expectedStatus="business-error"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">HTTP Errors</h2>
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
      </section>
    </div>
  )
}
