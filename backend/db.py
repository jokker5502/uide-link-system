from sqlmodel import create_engine, Session

DATABASE_URL = "postgresql://uide:uide.asu.123@localhost:5432/uide_link"

engine = create_engine(
    DATABASE_URL,
    echo=False
)

def get_session():
    with Session(engine) as session:
        yield session
