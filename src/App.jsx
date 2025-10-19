import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './component/dashboard'
import Register from './component/registration/registration'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div>
      <Register />
    </div>
    </>
  )
}

export default App
