import { debounce } from './utils/debounce'
import { throttle } from './utils/throttle'
import { random } from 'lodash'

const app = document.getElementById('app')

if (app) {
  app.innerHTML = `
    <h1>babel-loader 缓存演示</h1>
    <p>滚动 / 点击窗口观察防抖与节流输出（控制台）。</p>
    <p style="color:#888">
      二次构建时 babel-loader 会命中 node_modules/.cache/babel-loader 缓存，
      构建速度显著提升。
    </p>
  `
}

const onScroll = debounce((event: Event) => {
  console.log('debounced scroll', (event.target as Document).scrollingElement?.scrollTop)
}, 200)

const onClick = throttle((event: MouseEvent) => {
  console.log('throttled click', (event.target as HTMLElement).tagName)
}, 500)

document.addEventListener('scroll', onScroll)
document.addEventListener('click', onClick)

// 引入 lodash 增加编译量，便于观察缓存效果
console.log('random:', random(0, 100))
