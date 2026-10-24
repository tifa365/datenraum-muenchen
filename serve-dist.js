/*
 * This file is part of Civora UI.
 *
 * Copyright (C) 2025 DKSR GmbH.
 *
 * Civora UI is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { extname, join, dirname } from 'path'
import { fileURLToPath } from 'url'

const port = 3000
const staticDir = 'dist'
const __dirname = dirname(fileURLToPath(import.meta.url))

const server = createServer(async (req, res) => {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url
    filePath = join(__dirname, staticDir, filePath)
    const fileExt = extname(filePath)

    const contentType =
      {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      }[fileExt] || 'application/octet-stream'

    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  } catch (err) {
    console.error(err)
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('<h1>404 Not Found</h1>')
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html' })
      res.end('<h1>500 Internal Server Error</h1>')
    }
  }
})

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
