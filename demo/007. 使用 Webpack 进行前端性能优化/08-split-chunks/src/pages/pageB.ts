import { flatten } from 'lodash'
import { formatList, formatTitle } from '../shared/format'

const data = [[1, 2], [3, 4], [5, 6]]
const flat = flatten(data)

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>${formatTitle('页面 B')}</h1>
    <p>${formatList(flat)}</p>
    <p style="color:#888">
      页面 B 与页面 A 共享同样的 vendors 和 common chunk，不会重复打包。
    </p>
  `
}
