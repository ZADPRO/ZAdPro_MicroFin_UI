import { HashRouter } from 'react-router-dom'
import { MainRoutes } from './Pages/01-MainRoutes/MainRoutes'
function App(): JSX.Element {
  return (
    <>
      <HashRouter>
        <MainRoutes />
      </HashRouter>
    </>
  )
}

export default App
