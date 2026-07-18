/* ==========================================================================
   02-automated-sprites / script.js
   交互逻辑：
   1. 性能柱状图动画（IntersectionObserver 触发）
   2. 请求减少交互演示（滑块 + 模式切换）
   3. 顶部导航高亮
   ========================================================================== */

;(function () {
  'use strict'

  /* ------------------------------------------------------------------------
     1. 性能柱状图：进入视口时填充
     ------------------------------------------------------------------------ */

  const barFills = document.querySelectorAll('.bar-fill')

  function animateBars() {
    barFills.forEach(function (bar) {
      const w = bar.getAttribute('data-width')
      if (w) {
        bar.style.width = w
      }
    })
  }

  if ('IntersectionObserver' in window && barFills.length) {
    const chartObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateBars()
            chartObserver.disconnect()
          }
        })
      },
      { threshold: 0.2 },
    )
    const firstChart = document.querySelector('.perf-chart')
    if (firstChart) {
      chartObserver.observe(firstChart)
    }
  } else {
    // 降级：直接填充
    animateBars()
  }

  /* ------------------------------------------------------------------------
     2. 请求减少交互演示
     ------------------------------------------------------------------------ */

  const iconRange = document.getElementById('iconRange')
  const iconCountValue = document.getElementById('iconCountValue')
  const timelineBars = document.getElementById('timelineBars')
  const timelineEnd = document.getElementById('timelineEnd')
  const statRequests = document.getElementById('statRequests')
  const statSize = document.getElementById('statSize')
  const statTime = document.getElementById('statTime')
  const statSaving = document.getElementById('statSaving')
  const modeButtons = document.querySelectorAll('.mode-toggle button')

  let currentMode = 'separate' // 'separate' | 'sprite'

  /**
   * 估算参数
   * - 单独小图：每次请求 ~40ms（含握手），体积 ~2KB/张
   * - 雪碧图：1 次请求 ~80ms（体积大但单次），体积 ~1.4KB/图标（合并后更省）
   */
  const PERF = {
    separate: { perIconTime: 40, perIconSize: 2, overhead: 0 },
    sprite: { perIconTime: 4, perIconSize: 1.4, overhead: 80 }, // 80ms 基础 + 4ms/图标体积影响
  }

  function renderTimeline(iconCount) {
    if (!timelineBars) return
    timelineBars.innerHTML = ''

    const cfg = PERF[currentMode]
    const totalTime = currentMode === 'separate' ? iconCount * cfg.perIconTime : cfg.overhead

    if (currentMode === 'separate') {
      // 每个图标一条请求线，按顺序排列（HTTP/1.1 串行）
      for (let i = 0; i < iconCount; i++) {
        const bar = document.createElement('div')
        bar.className = 'timeline-bar'
        bar.style.width = '100%'
        bar.style.animationDelay = i * 30 + 'ms'
        timelineBars.appendChild(bar)
      }
    } else {
      // 雪碧图：只有 1 条请求线
      const bar = document.createElement('div')
      bar.className = 'timeline-bar sprite'
      bar.style.width = '60%'
      bar.style.height = '16px'
      timelineBars.appendChild(bar)
    }

    // 更新时间轴末端
    if (timelineEnd) {
      timelineEnd.textContent = totalTime + ' ms'
    }
  }

  function updateStats(iconCount) {
    const cfg = PERF[currentMode]
    const requests = currentMode === 'separate' ? iconCount : 1
    const sizeKB =
      currentMode === 'separate' ? iconCount * cfg.perIconSize : iconCount * cfg.perIconSize // 雪碧图合并后每图标均摊更小
    const timeMs = currentMode === 'separate' ? iconCount * cfg.perIconTime : cfg.overhead

    if (statRequests) {
      statRequests.querySelector('.stat-value').textContent = requests
      statRequests.classList.toggle('bad', currentMode === 'separate')
      statRequests.classList.toggle('good', currentMode === 'sprite')
    }
    if (statSize) {
      statSize.querySelector('.stat-value').textContent = sizeKB.toFixed(1) + ' KB'
    }
    if (statTime) {
      statTime.querySelector('.stat-value').textContent = timeMs + ' ms'
    }

    // 计算节省比例（相对传统模式）
    if (statSaving) {
      if (currentMode === 'sprite') {
        const separateTime = iconCount * PERF.separate.perIconTime
        const saving = Math.round(((separateTime - timeMs) / separateTime) * 100)
        statSaving.querySelector('.stat-value').textContent = saving + '%'
        statSaving.classList.add('good')
        statSaving.classList.remove('bad')
      } else {
        statSaving.querySelector('.stat-value').textContent = '--'
        statSaving.classList.remove('good')
      }
    }

    renderTimeline(iconCount)
  }

  // 滑块事件
  if (iconRange) {
    iconRange.addEventListener('input', function () {
      const count = parseInt(iconRange.value, 10)
      if (iconCountValue) {
        iconCountValue.textContent = count
      }
      updateStats(count)
    })
  }

  // 模式切换
  if (modeButtons.length) {
    modeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeButtons.forEach(function (b) {
          b.classList.remove('active')
        })
        btn.classList.add('active')
        currentMode = btn.getAttribute('data-mode')
        const count = parseInt(iconRange.value, 10)
        updateStats(count)
      })
    })
  }

  // 初始化
  if (iconRange) {
    updateStats(parseInt(iconRange.value, 10))
  }

  /* ------------------------------------------------------------------------
     3. 顶部导航高亮
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
     4. SVG symbol 演示：点击切换颜色
     ------------------------------------------------------------------------ */

  const svgDemos = document.querySelectorAll('.svg-symbol-demo')
  const colors = ['#38bdf8', '#fbbf24', '#4ade80', '#f472b6', '#a78bfa', '#f87171']
  let colorIndex = 0

  svgDemos.forEach(function (svg) {
    svg.addEventListener('click', function () {
      colorIndex = (colorIndex + 1) % colors.length
      svg.style.fill = colors[colorIndex]
    })
  })

  /* ------------------------------------------------------------------------
     5. 控制台说明
     ------------------------------------------------------------------------ */
  console.log(
    '%c 02 · 自动化雪碧图与方案对比 ',
    'background:#f472b6;color:#0f172a;font-weight:bold;padding:4px 8px;border-radius:4px;',
  )
  console.log(
    '本页面演示自动化雪碧图工具链、四种图标方案对比、请求减少模拟与现代替代方案。\n' +
      '核心结论：新项目用 SVG sprite，老项目用 CSS Sprites 过渡，HTTP/2 下减少请求已非首要目标。',
  )
})()
