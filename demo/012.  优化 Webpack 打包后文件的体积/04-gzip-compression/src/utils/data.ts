/**
 * 数据模块
 *
 * 包含一个较大的商品数据集，
 * 用于使打包产物超过 gzip 压缩阈值（10KB）。
 */

export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description: string
}

/**
 * 商品列表数据（模拟）
 * 包含大量数据以确保打包产物超过 gzip 阈值
 */
export const productList: Product[] = [
  { id: 1, name: '智能手机 Pro Max', category: '电子产品', price: 5999.0, stock: 150, description: '旗舰级智能手机，搭载最新处理器' },
  { id: 2, name: '笔记本电脑 Ultra', category: '电子产品', price: 8999.0, stock: 80, description: '轻薄笔记本电脑，16GB内存，512GB固态硬盘' },
  { id: 3, name: '无线蓝牙耳机', category: '电子产品', price: 399.0, stock: 500, description: '主动降噪蓝牙耳机，续航30小时' },
  { id: 4, name: '智能手表 Series 8', category: '电子产品', price: 2599.0, stock: 200, description: '健康监测智能手表，支持心电图检测' },
  { id: 5, name: '4K 高清显示器', category: '电子产品', price: 1599.0, stock: 120, description: '27英寸 4K IPS 面板，HDR400认证' },
  { id: 6, name: '机械键盘 RGB', category: '电子产品', price: 599.0, stock: 300, description: ' Cherry 红轴机械键盘，RGB背光' },
  { id: 7, name: '游戏鼠标 Pro', category: '电子产品', price: 299.0, stock: 400, description: '16000 DPI 游戏鼠标，可编程按键' },
  { id: 8, name: 'USB-C 扩展坞', category: '电子产品', price: 459.0, stock: 250, description: '11合1扩展坞，支持双4K输出' },
  { id: 9, name: '移动固态硬盘 1TB', category: '电子产品', price: 799.0, stock: 180, description: 'Type-C 移动固态硬盘，读写速度1050MB/s' },
  { id: 10, name: '无线充电器', category: '电子产品', price: 149.0, stock: 600, description: '15W 快速无线充电器，兼容多设备' },
  { id: 11, name: '纯棉 T 恤', category: '服装', price: 89.0, stock: 1000, description: '100% 精梳棉，舒适透气' },
  { id: 12, name: '牛仔裤 Slim', category: '服装', price: 199.0, stock: 800, description: '修身版型牛仔裤，弹力面料' },
  { id: 13, name: '运动鞋 Air', category: '服装', price: 499.0, stock: 450, description: '气垫减震运动鞋，轻量化设计' },
  { id: 14, name: '羽绒服 Warm', category: '服装', price: 699.0, stock: 300, description: '90% 白鹅绒填充，防风防水面料' },
  { id: 15, name: '帆布鞋 Classic', category: '服装', price: 159.0, stock: 700, description: '经典款帆布鞋，百搭舒适' },
  { id: 16, name: '棒球帽', category: '服装', price: 69.0, stock: 1200, description: '纯棉面料，可调节帽围' },
  { id: 17, name: '羊毛围巾', category: '服装', price: 129.0, stock: 500, description: '100% 羊毛，柔软保暖' },
  { id: 18, name: '皮带真皮', category: '服装', price: 189.0, stock: 400, description: '头层牛皮皮带，自动扣设计' },
  { id: 19, name: '运动裤 Jogger', category: '服装', price: 159.0, stock: 650, description: '束脚运动裤，速干面料' },
  { id: 20, name: '连帽卫衣', category: '服装', price: 249.0, stock: 550, description: '加绒连帽卫衣，宽松版型' },
  { id: 21, name: '咖啡豆 1kg', category: '食品', price: 129.0, stock: 300, description: '阿拉比卡咖啡豆，中度烘焙' },
  { id: 22, name: '进口牛奶 1L', category: '食品', price: 25.0, stock: 2000, description: '全脂纯牛奶，保质期12个月' },
  { id: 23, name: '坚果礼盒', category: '食品', price: 168.0, stock: 800, description: '6种坚果混合礼盒，年货首选' },
  { id: 24, name: '黑巧克力', category: '食品', price: 59.0, stock: 1500, description: '70% 可可含量黑巧克力' },
  { id: 25, name: '橄榄油 500ml', category: '食品', price: 89.0, stock: 900, description: '特级初榨橄榄油，冷压提取' },
  { id: 26, name: '蜂蜜 500g', category: '食品', price: 79.0, stock: 1100, description: '天然百花蜂蜜，无添加' },
  { id: 27, name: '茶叶礼盒', category: '食品', price: 299.0, stock: 400, description: '4种名茶组合礼盒' },
  { id: 28, name: '蓝莓酱 300g', category: '食品', price: 35.0, stock: 1800, description: '真实果粒蓝莓酱，低糖配方' },
  { id: 29, name: '燕麦片 1kg', category: '食品', price: 49.0, stock: 1600, description: '即食燕麦片，高纤维' },
  { id: 30, name: '海苔零食', category: '食品', price: 29.0, stock: 2500, description: '即食海苔脆片，非油炸' },
  { id: 31, name: '陶瓷茶杯', category: '家居', price: 39.0, stock: 1000, description: '骨瓷茶杯，含金边设计' },
  { id: 32, name: '记忆枕', category: '家居', price: 159.0, stock: 600, description: '慢回弹记忆棉枕，护颈设计' },
  { id: 33, name: '台灯 LED', category: '家居', price: 199.0, stock: 500, description: '可调色温 LED 护眼台灯' },
  { id: 34, name: '收纳箱', category: '家居', price: 49.0, stock: 1500, description: '可折叠收纳箱，大容量' },
  { id: 35, name: '毛巾浴巾套装', category: '家居', price: 99.0, stock: 800, description: '纯棉毛巾浴巾5件套' },
  { id: 36, name: '不粘锅 28cm', category: '家居', price: 189.0, stock: 450, description: '麦饭石不粘锅，少油烟' },
  { id: 37, name: '保温杯 500ml', category: '家居', price: 79.0, stock: 1200, description: '316不锈钢保温杯，12小时保温' },
  { id: 38, name: '晾衣架', category: '家居', price: 69.0, stock: 900, description: '折叠晾衣架，不锈钢材质' },
  { id: 39, name: '香薰蜡烛', category: '家居', price: 59.0, stock: 700, description: '大豆蜡香薰蜡烛，持久留香' },
  { id: 40, name: '地毯 120x180', category: '家居', price: 299.0, stock: 300, description: '北欧风格地毯，防滑底部' },
  { id: 41, name: '编程入门书籍', category: '图书', price: 69.0, stock: 500, description: '零基础入门编程，包含实战项目' },
  { id: 42, name: '英语词典', category: '图书', price: 89.0, stock: 600, description: '英汉双解词典，收录20万词条' },
  { id: 43, name: '历史通史', category: '图书', price: 128.0, stock: 350, description: '世界历史通史，精装版' },
  { id: 44, name: '小说集', category: '图书', price: 45.0, stock: 800, description: '经典中短篇小说集' },
  { id: 45, name: '烹饪食谱', category: '图书', price: 59.0, stock: 700, description: '500道家常菜谱，图文并茂' },
  { id: 46, name: '旅行指南', category: '图书', price: 79.0, stock: 550, description: '全球100个城市旅行攻略' },
  { id: 47, name: '健身教程', category: '图书', price: 55.0, stock: 650, description: '居家健身指南，无需器械' },
  { id: 48, name: '儿童绘本', category: '图书', price: 35.0, stock: 1200, description: '3-6岁儿童启蒙绘本套装' },
  { id: 49, name: '心理学入门', category: '图书', price: 49.0, stock: 900, description: '通俗心理学读物，深入浅出' },
  { id: 50, name: '科幻小说', category: '图书', price: 99.0, stock: 400, description: '获奖科幻小说三部曲' },
]

/**
 * 按分类筛选商品
 */
export function filterByCategory(category: string): Product[] {
  return productList.filter((item) => item.category === category)
}

/**
 * 按价格排序（升序）
 */
export function sortByPrice(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.price - b.price)
}

/**
 * 获取商品总数
 */
export function getTotalCount(): number {
  return productList.length
}

/**
 * 获取所有分类
 */
export function getCategories(): string[] {
  const categories = new Set(productList.map((item) => item.category))
  return Array.from(categories)
}

/**
 * 获取分类统计信息
 */
export function getCategoryStats(): Array<{ category: string; count: number; avgPrice: number }> {
  const categories = getCategories()
  return categories.map((category) => {
    const items = filterByCategory(category)
    const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length
    return {
      category,
      count: items.length,
      avgPrice: Math.round(avgPrice * 100) / 100,
    }
  })
}

/**
 * 搜索商品
 */
export function searchProducts(keyword: string): Product[] {
  const lowerKeyword = keyword.toLowerCase()
  return productList.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.description.toLowerCase().includes(lowerKeyword),
  )
}
