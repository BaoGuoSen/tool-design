import { RouteObject } from "react-router-dom"

import Index from '../page/interfaceConvert/index'

/**
 * 路由配置
 * @see http://react-guide.github.io/react-router-cn/docs/guides/basics/RouteConfiguration.html
 */
const routers: RouteObject[] = [
  {
    path: '/',
    element: <Index />
  }
]

export default routers