import os
import sys
import json
from sql_control import usersTable


def main():
    try:
        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link') 
        user_info = sys.argv[1].split(',')
        # user_info => [user_id, count]

        users_table.set_count_by_id(user_info[0], user_info[1])
        print("true")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
