import os
import shutil
import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

server_url = "http://127.0.0.1:8000"
originals_folder = "static/originals"
previews_folder = "static/previews"
max_bytes = 5 * 1024 * 1024
allowed = {"image/png": "png", "image/jpeg": "jpg"}

if not os.path.exists(originals_folder):
    os.makedirs(originals_folder)
if not os.path.exists(previews_folder):
    os.makedirs(previews_folder)

app = FastAPI(title="KT3 Nikita")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def make_preview(source, target):
    picture = Image.open(source)
    w, h = picture.size
    picture.thumbnail((150, 150))
    picture.save(target)
    return w, h


@app.post("/api/upload")
async def upload(photo: UploadFile = File(...)):
    if photo.content_type not in allowed:
        raise HTTPException(400, "Неверный формат файла")

    data = await photo.read()
    if len(data) > max_bytes:
        raise HTTPException(400, "Размер файла не должен быть больше 5 МБ")
    await photo.seek(0)

    name = uuid.uuid4().hex + "." + allowed[photo.content_type]
    original = originals_folder + "/" + name
    preview = previews_folder + "/" + name

    with open(original, "wb") as out:
        shutil.copyfileobj(photo.file, out)

    try:
        w, h = make_preview(original, preview)
    except Exception:
        os.remove(original)
        raise HTTPException(400, "Файл повреждён или это не картинка")

    return {
        "thumbnail_url": server_url + "/static/previews/" + name,
        "original_url": server_url + "/static/originals/" + name,
        "width": w,
        "height": h,
    }
