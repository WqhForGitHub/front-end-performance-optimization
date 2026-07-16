import { chunk } from 'lodash'
import { formatList, formatTitle } from '../shared/format'

const data = [1, 2, 3, 4, 5, 6]
const groups = chunk(data, 2)

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>${formatTitle('页面 A')}</h1>
    <p>${formatList(groups)}</p>
    <p style="color:#888">
      页面 A 与页面 B 共享 lodash（进入 vendors）和 format 模块（进入 common）。
    </p>
  `
}
