import { useState } from "react"
import ImageUpload from "./components/ImageUpload.jsx"

function App() {
  const [answer, setAnswer] = useState(null)
  const [message, setMessage] = useState("")

  const showResult = (data) => {
    setAnswer(data)
    setMessage("")
  }

  const showError = (text) => {
    setMessage(text)
    if (text !== "") {
      setAnswer(null)
    }
  }

  return (
    <div className="page">
      <h2>Отправка фото на сервер</h2>
      <ImageUpload onDone={showResult} onError={showError} />

      {message !== "" && <div className="msg-error">{message}</div>}

      {answer !== null && (
        <div className="card">
          <p>Миниатюра, которую вернул сервер:</p>
          <img src={answer.thumbnail_url} alt="mini" />
          <p>Размер оригинала: {answer.width} на {answer.height}</p>
          <a href={answer.original_url} target="_blank">Открыть оригинал</a>
        </div>
      )}
    </div>
  )
}

export default App
