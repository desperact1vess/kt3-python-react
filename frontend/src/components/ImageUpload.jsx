import { useState } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000"

function ImageUpload(props) {
  const [photo, setPhoto] = useState(null)
  const [localUrl, setLocalUrl] = useState(null)
  const [percent, setPercent] = useState(0)
  const [loading, setLoading] = useState(false)

  const selectPhoto = (event) => {
    const chosen = event.target.files[0]
    setPhoto(chosen)
    if (chosen) {
      setLocalUrl(URL.createObjectURL(chosen))
    } else {
      setLocalUrl(null)
    }
    setPercent(0)
    props.onError("")
  }

  const sendPhoto = (event) => {
    event.preventDefault()
    if (photo == null) {
      props.onError("Файл не выбран")
      return
    }

    const data = new FormData()
    data.append("photo", photo)
    setLoading(true)

    axios
      .post(API + "/api/upload", data, {
        onUploadProgress: (progressEvent) => {
          let value = 0
          if (progressEvent.total) {
            value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          }
          console.log("Загружено: " + value + "%")
          setPercent(value)
        },
      })
      .then((res) => {
        props.onDone(res.data)
      })
      .catch((error) => {
        if (error.response) {
          props.onError(error.response.data.detail)
        } else {
          props.onError("Сервер не отвечает, проверь что backend запущен")
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <form className="form" onSubmit={sendPhoto}>
      <input type="file" onChange={selectPhoto} />

      {localUrl !== null && (
        <div>
          <p>Выбранное фото (до отправки):</p>
          <img className="local" src={localUrl} alt="local" />
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Отправка..." : "Отправить"}
      </button>
      <p>Прогресс: {percent}%</p>
    </form>
  )
}

export default ImageUpload
