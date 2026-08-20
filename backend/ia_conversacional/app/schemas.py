from pydantic import BaseModel


class ChatRequest(BaseModel):
    mensaje: str
