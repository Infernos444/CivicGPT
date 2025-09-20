import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from './landing/main';
import Login from './login';
import Signup from './signup';
import StudentDashboard from './student/Dashboard';
import FacultyDashboard from './faculty/Dashboard';
import 'antd/dist/reset.css'; // for Ant Design v5+

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/student-dashboard' element={<StudentDashboard/>} />
        <Route path='/faculty-dashboard' element={<FacultyDashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;