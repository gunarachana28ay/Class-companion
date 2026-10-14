from django.core.management.base import BaseCommand
import subprocess


class Command(BaseCommand):
    help = "Creates MySQL user, grants privileges, and creates the database"

    def handle(self, *args, **kwargs):
        db_user = "root"
        db_password = input('Enter password for "root" user: ')
        new_db_name = "class_companion"
        new_db_user = "class_companion"
        new_db_password = "admin123"

        # MySQL commands to be executed
        mysql_commands = [
            f"CREATE USER IF NOT EXISTS '{new_db_user}'@'%' IDENTIFIED BY '{new_db_password}';",
            f"GRANT ALL PRIVILEGES ON *.* TO '{new_db_user}'@'%' WITH GRANT OPTION;",
            "FLUSH PRIVILEGES;",
            f"CREATE DATABASE IF NOT EXISTS {new_db_name};",
        ]

        # Forming the complete MySQL command string
        mysql_command = (
            f"mysql -u {db_user} -p{db_password} -e \"{'; '.join(mysql_commands)}\""
        )

        try:
            # Attempt MySQL command without sudo
            subprocess.run(mysql_command, shell=True, check=True)
            self.stdout.write(
                self.style.SUCCESS(
                    "Successfully created database user, granted privileges, and created database"
                )
            )
        except subprocess.CalledProcessError as e:
            self.stdout.write("Failed to execute MySQL commands. Retying with sudo.")
            # Retry with sudo
            sudo_mysql_command = f"sudo {mysql_command}"
            try:
                subprocess.run(sudo_mysql_command, shell=True, check=True)
                self.stdout.write(
                    self.style.SUCCESS(
                        "Successfully created database user, granted privileges, and created database"
                    )
                )
            except subprocess.CalledProcessError as e:
                self.stderr.write(
                    self.style.ERROR(
                        f"Failed to execute MySQL commands with sudo: {str(e)}"
                    )
                )
