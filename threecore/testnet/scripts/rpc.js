import { FetchRequest } from 'ethers'

// Native fetch supports managed proxy environments when Node is launched with
// NODE_USE_ENV_PROXY=1 (Node 24+). No provider URL or credential is logged here.
export function rpcRequest(url) {
  const request = new FetchRequest(url)
  request.timeout = 15000
  request.getUrlFunc = async (req, signal) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), req.timeout)
    signal?.checkSignal()
    signal?.addListener(() => controller.abort())
    try {
      const response = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body, signal: controller.signal })
      return { statusCode: response.status, statusMessage: response.statusText, headers: Object.fromEntries(response.headers), body: new Uint8Array(await response.arrayBuffer()) }
    } finally { clearTimeout(timer) }
  }
  return request
}
