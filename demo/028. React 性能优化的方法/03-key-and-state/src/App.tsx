import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, FC } from 'react'

// ============================================================
// 自定义 useReducer：本质 = useState + reducer 纯函数
// （env.d.ts 未声明官方 useReducer，这里用 useState 实现一个等价版本，
//   用于演示 reducer 思想；它与 React 官方 useReducer 行为一致）
// ============================================================
type Reducer<S, A> = (state: S, action: A) => S

function useReducer<S, A>(reducer: Reducer<S, A>, initial: S): [S, (action: A) => void] {
  const [state, setState] = useState<S>(initial)
  const dispatch = useCallback((action: A) => setState((prev) => reducer(prev, action)), [reducer])
  return [state, dispatch]
}

// ============================================================
// Section 1: key 对比（index vs id）
// 每行带一个「非受控」文本输入框，文字存在 DOM 里。
// 用 index 作 key 时，在头部插入新项会让 DOM 复用，导致文字与标签错位。
// ============================================================
interface KeyItem {
  id: number
  label: string
}

type KeyboardEvt = { key: string }

const KeyList: FC<{ useIndexKey: boolean }> = ({ useIndexKey }) => {
  const [items, setItems] = useState<KeyItem[]>(() => [
    { id: 1, label: 'Alice' },
    { id: 2, label: 'Bob' },
    { id: 3, label: 'Carol' },
  ])
  const idRef = useRef(3)

  const prepend = () => {
    idRef.current += 1
    const item: KeyItem = { id: idRef.current, label: `新成员 ${idRef.current}` }
    setItems((prev) => [item, ...prev])
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn" onClick={prepend}>
          在头部插入
        </button>
        <span className={useIndexKey ? 'badge bad' : 'badge'}>
          {useIndexKey ? 'key = index（坏）' : 'key = id（好）'}
        </span>
      </div>
      <ul className="todo">
        {items.map((item, i) => (
          <li key={useIndexKey ? i : item.id}>
            <span className="meta">id={item.id}</span>
            <strong style={{ width: 96, display: 'inline-block' }}>{item.label}</strong>
            <input type="text" placeholder={`给 ${item.label} 写备注`} />
          </li>
        ))}
      </ul>
      <div className="note" style={{ marginTop: 8 }}>
        先在每个输入框里写点文字，再点「在头部插入」，观察文字与标签是否对得上。
      </div>
    </div>
  )
}

// ============================================================
// Section 2: Todo List（useReducer + id key）
// ============================================================
interface Todo {
  id: number
  text: string
  done: boolean
}

type TodoAction =
  | { type: 'add'; id: number; text: string }
  | { type: 'toggle'; id: number }
  | { type: 'edit'; id: number; text: string }
  | { type: 'delete'; id: number }

let todoIdSeq = 0
const nextTodoId = (): number => (todoIdSeq += 1)

const initialTodos: Todo[] = [
  { id: nextTodoId(), text: '学习 React key 的作用', done: false },
  { id: nextTodoId(), text: '用 reducer 管理 todo 状态', done: false },
  { id: nextTodoId(), text: '对比 useState 与 useReducer', done: true },
]

const todoReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'add':
      return [{ id: action.id, text: action.text, done: false }, ...state]
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t))
    case 'edit':
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t))
    case 'delete':
      return state.filter((t) => t.id !== action.id)
    default:
      return state
  }
}

const TodoList: FC = () => {
  const [todos, dispatch] = useReducer(todoReducer, initialTodos)
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const text = input.trim()
    if (!text) return
    dispatch({ type: 'add', id: nextTodoId(), text })
    setInput('')
  }

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 10 }}>
        <input
          className="input"
          value={input}
          placeholder="输入待办内容后回车"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvt) => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <button className="btn" onClick={handleAdd}>
          添加
        </button>
      </div>
      <ul className="todo">
        {todos.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch({ type: 'toggle', id: t.id })}
            />
            <input
              type="text"
              value={t.text}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                dispatch({ type: 'edit', id: t.id, text: e.target.value })
              }
            />
            <span className="meta">id={t.id}</span>
            <button className="del" onClick={() => dispatch({ type: 'delete', id: t.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>
      <div className="note" style={{ marginTop: 8 }}>
        列表项使用 <code>key = todo.id</code>，删除 / 排序时每行的组件状态都能正确跟随， 不会错位。
      </div>
    </div>
  )
}

// ============================================================
// App
// ============================================================
const App: FC = () => {
  return (
    <div className="app">
      <h1>key 与状态管理</h1>
      <p className="subtitle">
        演示列表 key 的正确选择（index vs id）以及 useReducer / useState 两种状态管理方式。
      </p>

      <section className="section">
        <h2>1. key 对比：index vs id</h2>
        <div className="grid-2">
          <KeyList useIndexKey={true} />
          <KeyList useIndexKey={false} />
        </div>
        <div className="note warn" style={{ marginTop: 12 }}>
          左侧用 index 作 key：在输入框写文字后点「在头部插入」，输入框文字会与标签错位 （DOM
          被按位置复用，但逻辑项已改变）。右侧用 id 作 key：每行连同输入框一起正确移动。
        </div>
      </section>

      <section className="section">
        <h2>2. Todo List（useReducer + id key）</h2>
        <TodoList />
      </section>

      <section className="section">
        <h2>3. useState vs useReducer</h2>
        <pre className="code">{`// useState 方式：状态分散，更新逻辑写在组件里
const [todos, setTodos] = useState(initialTodos)
const add = (text) => setTodos([{ id: nextId(), text, done: false }, ...todos])
const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))

// useReducer 方式：状态集中，更新逻辑抽成纯函数 reducer
const [todos, dispatch] = useReducer(todoReducer, initialTodos)
const add = (text) => dispatch({ type: 'add', id: nextId(), text })
const toggle = (id) => dispatch({ type: 'toggle', id })`}</pre>
        <table className="cmp" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>维度</th>
              <th>useState</th>
              <th>useReducer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>状态组织</td>
              <td>多个独立 state，分散</td>
              <td>一个 state 对象，集中</td>
            </tr>
            <tr>
              <td>更新方式</td>
              <td>直接 setState</td>
              <td>dispatch action，reducer 决定</td>
            </tr>
            <tr>
              <td>可测试性</td>
              <td>逻辑在组件内，难单独测试</td>
              <td>reducer 是纯函数，易测试</td>
            </tr>
            <tr>
              <td>适用场景</td>
              <td>简单 / 独立的状态</td>
              <td>复杂 / 相互关联的状态机</td>
            </tr>
          </tbody>
        </table>
        <div className="note" style={{ marginTop: 12 }}>
          本 demo 中的 useReducer 是用 useState 实现的自定义版本，本质等价：每次 dispatch 就是用
          reducer(prev, action) 计算下一个 state。
        </div>
      </section>
    </div>
  )
}

export default App
