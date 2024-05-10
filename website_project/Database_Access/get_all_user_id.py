from sql_control import usersTable
import os
import sys
import json

def main():
    # return ['user_id', 'email', 'username', `'b'hashed_password'`, 'count']   
    users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')
    details = json.loads(sys.argv[1])
    user_info = users_table.get_all_by_id(details)
    print(user_info)


# runs the main function
if __name__ == "__main__":
    main()
