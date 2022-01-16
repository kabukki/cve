import { Routes, Route, Link } from 'react-router-dom';

import { Home } from '../Home';
import { Vulnerability } from '../Vulnerability';

import logo from '../assets/logo.svg'
import './index.css'

export const App = () => {
  return (
    <div className="App">
      <Link to="/">
        <img src={logo} className="logo" alt="logo" />
      </Link>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cve/:id" element={<Vulnerability />} />
      </Routes>
    </div>
  )
};
