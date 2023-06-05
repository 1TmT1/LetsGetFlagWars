import sys
import json
from salt_hash_password import create_salted_hash_known_salt
from sql_control import usersTable
import os


# get the salt of the user's password
def get_salt(table, email):
    user_password = table.get_user_password(email)
    user_password = user_password[0]
    user_password = user_password.split(":")
    return user_password[0][2:].encode('utf-8')
    

def main():
    try:
        details = json.loads(sys.argv[1])
        # details = {"email":'test9@gmail.com', "password":'123456'}
        users_table = usersTable(os.path.join('./', 'database.db'), 'users', 'user_id', 'email', 'username', 'password', 'count', 'user_type', 'reset_link')

        if users_table.check_email_existance(details["email"]): # if email is existing
            salt = get_salt(users_table, details["email"]) # get salt of the password
            salted_hash_password = create_salted_hash_known_salt(details["password"], salt) # hash password inserted by user and the salt
            salted_hash_password = str((salt.decode('utf-8') + ":" + salted_hash_password.decode('utf-8')).encode('utf-8')) # encoded hashed password
            if users_table.check_user_password(details["email"], salted_hash_password): # if hash is the same hash that can be found in the database
                user_id = str(users_table.get_user_id_by_email(details["email"])).split(',')[0][1:] # get user id
                count = str(users_table.get_count_by_email(details["email"])).split(',')[0][1:] # get count
                user_type = str(users_table.get_user_type_by_email(details["email"])).split(',')[0][1:] # get user type
                username = str(users_table.get_username_by_email(details["email"])) # get username
                username = username.split(',') #
                username = username[0][2:len(username[0])-1]
                print("true," + user_id + "," + username + "," + count + "," + user_type)
            else:
                print("false")
        else:
            print("false")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
