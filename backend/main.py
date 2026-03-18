from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.core.auth.routes import router as auth_router
from app.core.notifications.routes import router as notifications_router
from app.core.chat.routes import router as chat_router

# Import domain routers
from app.modules.healthcare.routes import router as healthcare_router
from app.modules.municipal.routes import router as municipal_router
from app.modules.education.routes import router as education_router
from app.modules.civilian.routes import router as civilian_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="A unified civic engagement platform connecting citizens with Healthcare, Municipal, and Educational institutions",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core routers
app.include_router(auth_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

# Include domain routers
app.include_router(healthcare_router, prefix="/api")
app.include_router(municipal_router, prefix="/api")
app.include_router(education_router, prefix="/api")
app.include_router(civilian_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else None
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
