/**
 * 登录模块（预加载 - preload）
 *
 * 这个模块在当前页面一定会被使用（用户登录是核心流程），
 * 使用 webpackPreload 让它与主 bundle 并行下载，高优先级。
 */

export interface LoginResult {
  success: boolean
  token: string
  message: string
}

export function login(username: string, password: string): LoginResult {
  if (username && password.length >= 6) {
    return {
      success: true,
      token: `token_${Date.now()}_${username}`,
      message: '登录成功',
    }
  }
  return {
    success: false,
    token: '',
    message: '用户名或密码不正确',
  }
}

export function logout(): void {
  console.log('用户已退出登录')
}
