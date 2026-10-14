#!/bin/bash

# Function to install required packages
install_packages() {
    sudo apt-get update
    sudo apt-get install -y python3-venv default-libmysqlclient-dev gcc pkg-config python3.12-dev mysql-server nodejs npm
    sudo npm install -g pm2
}

# Function to update and fetch git branch
update_git() {
    git pull --rebase origin develop
}

# Function to start the backend server
start_backend() {
    cd ./backend/
    python3 -m venv env
    source env/bin/activate
    pip install -r requirements.txt
    python manage.py create_db
    python manage.py migrate
    pm2 start python --name "backend" -- manage.py runserver 0.0.0.0:8000
    cd ..
    echo "Backend server started and managed by pm2"
}

# Function to start the frontend server
start_frontend() {
    cd ./frontend/
    npm install
    export PORT=80
    sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
    pm2 start npm --name "frontend" -- start
    cd ..
    echo "Frontend server started and managed by pm2"
}

# Function to start the server
start_server() {
    echo "Do you want to update the git repository? (y/n): "
    read update_git_choice
    if [ "$update_git_choice" == "y" ]; then
        update_git
    else
        echo "Skipping git update..."
    fi
    install_packages
    start_frontend
    start_backend
}

# Function to stop the server
stop_server() {
    # Stop backend server using pm2
    pm2 stop "backend" && pm2 delete "backend"
    echo "Backend server stopped and removed from pm2"

    # Stop frontend server using pm2
    pm2 stop "frontend" && pm2 delete "frontend"
    echo "Frontend server stopped and removed from pm2"
}

# Check the first argument
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        start_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        ;;
esac
