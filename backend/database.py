from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker



# Configuración para AWS RDS (PostgreSQL)
import urllib.parse

# CREDENCIALES
rds_host = "uide-link-db.c07yeca6uwgy.us-east-1.rds.amazonaws.com"
rds_user = "postgres"
rds_password = urllib.parse.quote_plus("Uide2025$Segura!#") # Codificamos la contraseña por los caracteres especiales
rds_db = "postgres"

SQLALCHEMY_DATABASE_URL = f"postgresql://{rds_user}:{rds_password}@{rds_host}/{rds_db}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
