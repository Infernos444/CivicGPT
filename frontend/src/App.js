import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './landing/main';
import Login from './login';
import Signup from './signup';
import Dashboard from './dashboard/dashboard'; // Your new dashboard
import 'antd/dist/reset.css'; // for Ant Design v5+

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/dashboard' element={<Dashboard/>} /> {/* Updated to your new dashboard */}
        {/* Remove or comment out the old student/faculty routes */}
        {/* <Route path='/student-dashboard' element={<StudentDashboard/>} /> */}
        {/* <Route path='/faculty-dashboard' element={<FacultyDashboard/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;