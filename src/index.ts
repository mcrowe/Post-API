import * as http from 'http'


export type IController = any


export default function start(port: number, controller: IController) {

  const server = http.createServer(async (req, res) => {
    // TODO: CORS Headers
    const t = Date.now()

    res.statusCode = 200

    if (!req.url || !req.url.endsWith('/action')) {
      sendJSON(res, {error: 'Invalid request'})
      log(`Invalid request url: ${req.url}`)
      return
    }

    let body: IActionBody

    try {
      body = await parseBody(req)

      log(`[${body.action}] Started`)

      const [result, message] = await handle(body, controller)

      sendJSON(res, result)
      log(`[${body.action}] Completed in ${Date.now() - t}ms => ${message}`)

    } catch (err) {
      sendJSON(res, {error: 'Invalid request'})
      log('Invalid request body')
    }

  })

  server.listen(port, (err: any) => {
    if (err) {
      return log('something bad happened: ' + err.message)
    }

    log(`Ready and listening on port ${port}`)
  })
}


function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body: any = []

    req.on('error', (err) => {
      reject('Error parsing body as JSON: ' + err.message)

    }).on('data', (chunk: Buffer) => {
      body.push(chunk)

    }).on('end', () => {
      try {
        body = Buffer.concat(body).toString()
        const json = JSON.parse(body)
        resolve(json)
      } catch (err) {
        reject('Error parsing body as JSON: ' + err.message)
      }

    })
  })
}


function sendJSON(res: http.OutgoingMessage, json: any) {
  res.end(JSON.stringify(json))
}



type IResult = [object, string]

interface IActionBody {
  action: string
  params: object
}


async function handle(body: IActionBody, controller: IController): Promise<IResult> {
  const action = controller[body.action]

  if (action) {
    try {
      const data = await action(body.params)
      return [
        { data },
        'OK'
      ]

    } catch (err) {
      return [
        {error: 'action_handler_error'},
        `Handler Error: ${err.message}`
      ]
    }

  }

  return [
    {error: 'action_not_found'},
    'Not Found'
  ]
}


function log(msg: string) {
  console.log(msg)
}