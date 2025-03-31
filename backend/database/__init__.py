from database.database import Base
# Need this file to solve an import error in database/database.py
# This initiate the folder database as a package
# So in any file in the database folder, I can import the database.database.Base as database.Base
# This solve a conflict in the alembic/env.py file