import { spawn } from 'node:child_process'

import { startServer } from './serve.mjs'

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error('Servidor de preview não respondeu')
}

function startPreview(root, port) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const child = spawn(command, ['vite', 'preview', '--port', port, '--strictPort'], {
    cwd: root,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })
  return { kill: () => child.kill() }
}

export async function startHost({ server, baseUrl, root }) {
  const port = new URL(baseUrl).port
  if (server === 'h2') {
    const instance = await startServer(Number(port))
    return { kill: () => instance.close() }
  }
  const host = startPreview(root, port)
  await waitForServer(baseUrl)
  return host
}
