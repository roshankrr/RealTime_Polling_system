
import { Route,Routes } from "react-router-dom"
import LivePollingLanding from "./routes/Live-polling-landing"
import PollCreator from "./routes/Poll-creator"
import StudentStarter from "./routes/Student-register"
import QuestionPoll from "./routes/QuestionPoll"
import KickedOut from "./routes/Kicked"
import { createContext, useState } from "react"
import { socket } from "./socket/socket"
// Create and export the context
export const userContext = createContext<{
  userRole: 'student' | 'teacher';
  setUserRole: (role: 'student' | 'teacher') => void;
}>({
  userRole: 'student',
  setUserRole: () => {}
});


export const socketContext=createContext(socket);


const App = () => {
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  


  return (
    <userContext.Provider value={{ userRole, setUserRole }}>
      <socketContext.Provider value={socket}>
      <Routes>
        <Route path="/" element={<LivePollingLanding/>} />
        <Route path="/create-poll" element={<PollCreator/>} />
        <Route path="/student-register" element={<StudentStarter/>} />
        <Route path="/question" element={<QuestionPoll/>} />
        <Route path="/kicked" element={<KickedOut/>} />
      </Routes>
      </socketContext.Provider>
    </userContext.Provider>
  )
}

export default App