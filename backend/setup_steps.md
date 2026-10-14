# How to Build and Run

## Windows:

1. **Ensure Python is installed. Preferred version: 3.12** 

2. **Navigate to the backend folder**: ```cd .\backend\```

3. **Create a virtual environment named 'env'**: ```py -m venv env```

4. **Activate the virtual environment**: ```env\Scripts\activate```

4. **Install build tools**: ```sudo apt-get install pkgconfig libmysqlclient-dev```

5. **Install the required Python packages**: ```pip install -r requirements.txt```

6. **Setup the database**: ```python manage.py create_db```

7. **Apply the database migrations**: ```python manage.py migrate```

8. **Populate the database with initial data**: ```python manage.py populate_db```

9. **Run the Django development server**: ```python manage.py runserver 0.0.0.0:8000```

## Ubuntu

1. **Ensure Python is installed. Preferred version: 3.12** 

2. **Update the package list**: ```sudo apt-get update```

3. **Install necessary packages**: ```sudo apt-get install -y python3-venv default-libmysqlclient-dev gcc pkg-config python3.12-dev mysql-server nodejs npm```

4. **Install pm2 globally using npm**: ```sudo npm install -g pm2```

5. **Navigate to the backend directory**: ```cd backend/```

6. **Create a virtual environment named 'env'**: ```python3 -m venv env```

7. **Activate the virtual environment**: ```source env/bin/activate```

8. **Install the required Python packages**: ```pip install -r requirements.txt```

9. **Setup the database**: ```python manage.py create_db```

10. **Apply the database migrations**: ```python manage.py migrate```

11. **Populate the database with initial data**: ```python manage.py populate_db```

12. **Run the Django development server**: ```python manage.py runserver 0.0.0.0:8000```

# How to Delete and Re-Create the Database

1. **Log in to MySQL as the 'class_companion' user**: ```mysql -u class_companion -p ```
   - **When prompted, enter the password**: `admin123`

3. **Drop the 'class_companion' database**:```DROP DATABASE class_companion;```

4. **Recreate the database using Django**: ```python manage.py create_db```
