/* ==========================================================================
   01-basic-sprites / script.js
   交互逻辑：
   1. background-position 原理可视化（点击按钮移动背景图与视窗）
   2. 顶部导航高亮当前章节
   ========================================================================== */

;(function () {
  'use strict'

  /* ------------------------------------------------------------------------
     1. background-position 可视化交互
     ------------------------------------------------------------------------ */

  const fullSheet = document.getElementById('fullSheet')
  const singleIcon = document.getElementById('singleIcon')
  const currentPos = document.getElementById('currentPos')
  const controls = document.getElementById('positionControls')

  // 视窗框：通过 transform 移动到对应单元格位置（仅用于可视化提示）
  // 实际 CSS 中视窗是固定的，移动的是背景图。这里反向演示更直观。
  const viewportFrame = document.getElementById('viewportFrame')

  /**
   * 更新可视化模型与实际显示
   * @param {number} x  background-position-x（px）
   * @param {number} y  background-position-y（px）
   */
  function updatePosition(x, y) {
    // 1. 实际显示：给 single-icon-demo 设置 background-position
    //    （注意：singleIcon 需要具备 .sprite 的背景图，这里直接复用 sprite 类的样式）
    if (singleIcon) {
      // 确保 singleIcon 有背景图
      if (!singleIcon.style.backgroundImage) {
        // 复用 .sprite 的 background-image（从 CSS 中继承不到，需手动设）
        singleIcon.style.backgroundImage = window.getComputedStyle(
          document.querySelector('.sprite'),
        ).backgroundImage
        singleIcon.style.backgroundRepeat = 'no-repeat'
      }
      singleIcon.style.backgroundPosition = x + 'px ' + y + 'px'
    }

    // 2. 可视化模型：移动完整雪碧图
    //    background-position: -64px 0  =>  背景图向左移 64px => transform: translateX(-64px)
    if (fullSheet) {
      fullSheet.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
    }

    // 3. 视窗框保持在 (0,0)，但通过高亮当前单元格增强效果
    //    视窗框始终在左上角 (0,0)，移动的是背景图
    if (viewportFrame) {
      viewportFrame.style.transform = 'translate(0, 0)'
    }

    // 4. 更新文字
    if (currentPos) {
      currentPos.textContent = x + 'px ' + y + 'px'
    }
  }

  // 绑定按钮事件
  if (controls) {
    const buttons = controls.querySelectorAll('button')
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const pos = btn.getAttribute('data-pos').split(',')
        const x = parseInt(pos[0], 10)
        const y = parseInt(pos[1], 10)

        updatePosition(x, y)

        // 高亮当前按钮
        buttons.forEach(function (b) {
          b.classList.remove('active')
        })
        btn.classList.add('active')
      })
    })

    // 初始化为第一个
    updatePosition(0, 0)
  }

  /* ------------------------------------------------------------------------
     2. 顶部导航：滚动时高亮当前章节
     ------------------------------------------------------------------------ */

  const navLinks = document.querySelectorAll(".nav a[href^='#']")
  const sections = []
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href').slice(1)
    const sec = document.getElementById(id)
    if (sec) {
      sections.push({ id: id, el: sec, link: link })
    }
  })

  function highlightNav() {
    const scrollY = window.scrollY + 120
    let current = null
    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollY) {
        current = s
      }
    })
    sections.forEach(function (s) {
      s.link.classList.toggle('active', s === current)
    })
  }

  window.addEventListener('scroll', highlightNav, { passive: true })
  highlightNav()

  /* ------------------------------------------------------------------------
     3. 雪碧图全貌：鼠标移入显示单元格坐标提示（增强体验）
     ------------------------------------------------------------------------ */

  const sheetFull = document.querySelector('.sprite-sheet-full')
  if (sheetFull) {
    sheetFull.style.cursor = 'crosshair'
    sheetFull.addEventListener('mousemove', function (e) {
      const rect = sheetFull.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / 64) * 64
      const y = Math.floor((e.clientY - rect.top) / 64) * 64
      const col = x / 64
      const row = y / 64
      const labels = ['Home', 'User', 'Star', 'Heart']
      const state = row === 0 ? 'default' : 'hover'
      sheetFull.title =
        '单元格 (' +
        col +
        ', ' +
        row +
        ') - ' +
        labels[col] +
        ' [' +
        state +
        ']\nbackground-position: -' +
        x +
        'px -' +
        y +
        'px'
    })
  }

  /* ------------------------------------------------------------------------
     4. 控制台输出说明
     ------------------------------------------------------------------------ */
  console.log(
    '%c 01 · 基础 CSS Sprites 演示 ',
    'background:#38bdf8;color:#0f172a;font-weight:bold;padding:4px 8px;border-radius:4px;',
  )
  console.log(
    '本页面所有图标共用同一张内联 SVG 雪碧图，仅 background-position 不同。\n' +
      '打开 DevTools -> Network -> 过滤 img/stylesheet，确认只有 1 次资源请求（CSS 本身）。',
  )
})()
