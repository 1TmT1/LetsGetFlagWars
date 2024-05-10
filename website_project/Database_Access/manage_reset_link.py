import sys
import json
from sql_control import usersTable
import os


def main():
    try:
        details = json.loads(sys.argv[1])
        # details ==> { operation: "operation", user_id: "user_id", reset_link: "reset_link",  }
        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')        

        if details["operation"] == "update":
            users_table.update_reset_link_by_id(details["user_id"], details["reset_link"])
            print("true")
        elif details["operation"] == "compare":
            user_reset_link = users_table.get_reset_link_by_id(details["user_id"]) #return tuple
            user_reset_link = user_reset_link[0]
            if user_reset_link == details["reset_link"]:
                print("true")
            else:
                print("false")
        else:
            print("false")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
