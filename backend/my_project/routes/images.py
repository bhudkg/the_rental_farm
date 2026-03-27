import re

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["images"])

CLOUDINARY_URL_PATTERN = re.compile(
    r"^https://res\.cloudinary\.com/.+\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff)$",
    re.IGNORECASE,
)


class ImageUploadRequest(BaseModel):
    image_url: str


class ImageUploadResponse(BaseModel):
    image_url: str
    message: str


@router.post(
    "/upload-image",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_200_OK,
)
def store_image_url(body: ImageUploadRequest):
    url = body.image_url.strip()

    if not url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image URL must use HTTPS.",
        )

    if not CLOUDINARY_URL_PATTERN.match(url.split("?")[0]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Cloudinary image URLs are accepted.",
        )

    return ImageUploadResponse(
        image_url=url,
        message="Image URL stored successfully.",
    )
