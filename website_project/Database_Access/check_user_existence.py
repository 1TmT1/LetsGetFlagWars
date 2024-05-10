import sys
import json
from sql_control import usersTable
import os

def main():
    try:
        details = json.loads(sys.argv[1])

        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')
        if "email" in details and "username" in details:
            email_existance = users_table.check_email_existance(details["email"])
            if email_existance:
                print("true")
            username_existance = users_table.check_username_existance(details["username"])
            if username_existance:
                print("true")
            else:
                print("false")
        elif "email" in details:
            email_existance = users_table.check_email_existance(details["email"])
            if email_existance:
                user_id = users_table.get_user_id_by_email(details["email"])
                print(details["email"] + ", " + str(user_id[0]))
            else:
                print("false")
        elif "username" in details:
            email_of_username = users_table.get_email_by_username(details["username"])
            email_of_username = email_of_username[0] # email_of_username - tuple - (email,)
            if email_of_username:
                user_id = users_table.get_user_id_by_email(email_of_username)
                print(email_of_username + ", " + str(user_id[0]))
            else:
                print("false")
        else:
            print("false")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
