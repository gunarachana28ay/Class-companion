## Server SSH

ssh -i "class_companion_keypair.pem" ubuntu@ec2-13-49-57-37.eu-north-1.compute.amazonaws.com

## SSH Credentials

- **Host:** `13.49.57.37`
- **Port:** `22`
- **User:** `ubuntu`
- **Password:** ``

## Database Connection (using mysql workbench)
1. Select "Standard TCP/IP over SSH" as connection method.
2. For SSH Hostname enter: `13.49.57.37:22`
3. For SSH Username enter: `ubuntu`
4. For SSH key file select the included .pem file
5. For MySQL Hostname enter: `127.0.0.1`
6. For MySQL Server Port enter: `3306`
7. For Username enter: `root`
6. For Password hit `Store in Vault` button and then enter: `password`
7. Click `OK` button on the bottom right to connect.