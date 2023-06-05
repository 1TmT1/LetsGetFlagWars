# import all the modules needed in order to run the program
import random
import string
import base64
import bcrypt


# return a random letter (a, b, c) upper or lower
def get_random_letter():
    random_num = random.randint(0, 1)
    if random_num == 0:
        letter = random.choice(string.ascii_lowercase)
    else:
        letter = random.choice(string.ascii_uppercase)
    return letter


# return a random number (0 => 9)
def get_random_number():
    random_number = random.randint(0, 9)
    return random_number


# check if every letter in the password is upper, then if all the letters are upper it will change the first to a lower case
def every_letter_upper(salt, num_letters):
    upper_counter = 0
    for x in salt:
        if x.isupper():
            upper_counter += 1
        if upper_counter == num_letters:
            break

    if upper_counter == num_letters:
        for x in range(len(salt)):
            if salt[x].isupper():
                password = list(salt)
                password[x] = password[x].lower()
                password = "".join(password)
                break
    return salt


# check if every letter in the password is lower, then if all the letters are lower it will change the first to a upper case
def every_letter_lower(salt, num_letters):
    lower_counter = 0
    for x in salt:
        if x.islower():
            lower_counter += 1
        if lower_counter == num_letters:
            break

    if lower_counter == num_letters:
        for x in range(len(salt)):
            if salt[x].islower():
                salt = list(salt)
                salt[x] = salt[x].upper()
                salt = "".join(salt)
                break
    return salt


# call for the functions that check the letters and return the new password
def check_salt(salt, num_letters):
    salt = every_letter_upper(salt, num_letters)
    salt = every_letter_lower(salt, num_letters)
    return salt


# create random string of 100 characters
def create_salt():
    try:
        salt_length = 100
        num_letters = 60
        num_numbers = 25
        temp_num_letters = num_letters
        salt = ""
        if (num_numbers + temp_num_letters) < salt_length:
            for x in range(salt_length):
                salt += get_random_letter()
                temp_num_letters -= 1
                salt += str(get_random_number())
                num_numbers -= 1
            if salt.isupper() and not salt.islower():
                letter = 1
                for x in salt:
                    if letter == 1:
                        if str.isalpha(x):
                            num = random.randint(0, 1)
                            if num == 1:
                                x.lower()
                                letter -= 1
                    else:
                        break
            elif not salt.isupper() and salt.islower():
                letter = 1
                for x in salt:
                    if letter == 1:
                        if str.isalpha(x):
                            num = random.randint(0, 1)
                            if num == 1:
                                x.upper()
                                letter -= 1
                    else:
                        break
            return check_salt(salt, num_letters)
    except:
        print("Error, please enter a whole valid number...")


# main function - calls to the functions in order to create a unique salted hash!
def create_salted_hash_random_salt(password):
    salt = create_salt().encode('utf-8')
    password = base64.b64encode(password.encode('utf-8'))
    salt = bcrypt.gensalt() + salt
    hashed = bcrypt.hashpw(password, salt)
    salted_hashed_pass = salt + b":" + hashed
    return salted_hashed_pass


# create hashed password with given password and salt
def create_salted_hash_known_salt(password, salt):
    password = base64.b64encode(password.encode('utf-8'))
    hashed = bcrypt.hashpw(password, salt)
    return hashed
