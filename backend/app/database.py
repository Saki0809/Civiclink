from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Initialize Supabase client
def get_supabase_client() -> Client:
    """Get Supabase client with anon key for user-context operations."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase_admin_client() -> Client:
    """Get Supabase client with service role key for admin operations."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# Dependency for FastAPI
async def get_db() -> Client:
    """FastAPI dependency to get database client."""
    return get_supabase_client()
