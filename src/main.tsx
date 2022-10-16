import ReactDOM from "react-dom/client"
import { useRoutes, HashRouter } from "react-router-dom"

import "./main.less"
import routers from "./router"

const Index = () => useRoutes(routers)

const App = () => {
  return (
    // <React.StrictMode>
    <HashRouter>
      <Index />
    </HashRouter>
    // </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />)