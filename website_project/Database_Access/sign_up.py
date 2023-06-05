import sys
import json
from salt_hash_password import create_salted_hash_random_salt
from sql_control import usersTable
import os

def main():
    try:
        # sys.argv[1] ==> {"email":"hello@gmail.com","username":"1","password":"12"}
        details = json.loads(sys.argv[1])
        # details = {"email":"test12@gmail.com", "username":"test", "password":"test"}
        # create table object
        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')
        if users_table.check_email_existance(details["email"]) or users_table.check_username_existance(details["username"]): # if the user is existing
            print('false') # print false (return false)
        else:
            salted_hash_password = create_salted_hash_random_salt(details["password"]) # create hashed password with salt
            users_table.insert(details['email'], details['username'], salted_hash_password) # insert the new user to the database  
            print('true') # print true(return true - user created)
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
    