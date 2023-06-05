import sys
import json
from salt_hash_password import create_salted_hash_random_salt
from sql_control import usersTable
import os


def main():
    try:
        details = json.loads(sys.argv[1])
        # details ==> { user_id: "user_id", new_password: "new_password" }
        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')
        
        salted_hash_password = create_salted_hash_random_salt(details["new_password"]) # creates the hashed password
        users_table.change_user_password_by_user_id(details["user_id"], salted_hash_password) # change the password of the user to the new one
        print("true")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
