import sqlite3
import random


class SqlTable(object):
    def __init__(self, database_file, table_name):
        self.table_name = table_name
        self.database_file = database_file

    # get_all_users
    def get_all_data_from_table(self):
        connection = sqlite3.connect(self.database_file)
        str_select = """SELECT * FROM {}""".format(self.table_name)
        cursor = connection.cursor()
        cursor.execute(str_select)
        all_users = cursor.fetchall()
        connection.commit()
        connection.close()
        return all_users


class usersTable(SqlTable):
    def __init__(self, database_file, table_name, user_id, email, username, password, count, user_type, reset_link):
        SqlTable.__init__(self, database_file, table_name)
        self.user_id = user_id
        self.email = email
        self.username = username
        self.password = password
        self.count = count
        self.user_type = user_type
        self.reset_link = reset_link
        connection = sqlite3.connect(self.database_file)
        c = connection.cursor()
        string = """CREATE TABLE IF NOT EXISTS {}({} INTEGER PRIMARY KEY AUTOINCREMENT, {} TEXT NOT NULL, {} TEXT NOT NULL, {} TEXT NOT NULL, {} INTEGER NOT NULL, {} INTEGER NOT NULL, {} TEXT NOT NULL);""".format(self.table_name, self.user_id, self.email, self.username, self.password, self.count, self.user_type, self.reset_link)
        c.execute(string)
        connection.commit()
        connection.close()
    
    # insert new user to the database
    def insert(self, email, username, password):
        connection = sqlite3.connect(self.database_file)
        str_insert = """INSERT INTO {}({}, {}, {}, {}, {}, {}) VALUES ("{}\", "{}\", "{}\", "{}\", "{}\", "{}\")""".format(self.table_name, self.email, self.username, self.password, self.count, self.user_type, self.reset_link, email, username, password, 0, 0, "")
        connection.execute(str_insert)
        connection.commit()
        connection.close()
    
    # check if email is existing in the database
    def check_email_existance(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select = """SELECT {} FROM {} WHERE {}=?""".format(self.email, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        if result:
            return True
        else:
            return False
    
    # check if username is existing in the database
    def check_username_existance(self, username):
        connection = sqlite3.connect(self.database_file)
        str_select = """SELECT {} FROM {} WHERE {}=?""".format(self.username, self.table_name, self.username)
        cursor = connection.cursor()
        cursor.execute(str_select, (username,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        if result:
            return True
        else:
            return False
    
    # delete user by an email
    def delete_by_email(self, email):
        connection = sqlite3.connect(self.database_file)
        str_delete = """DELETE FROM {} WHERE {}=?""".format(self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_delete, (email,))
        connection.commit()
        connection.close()
    
    # get_max_id
    def get_max_user_id(self):
        connection = sqlite3.connect(self.database_file)
        str_select = """SELECT MAX({}) FROM {}""".format(self.user_id, self.table_name)
        cursor = connection.cursor()
        cursor.execute(str_select)
        result = cursor.fetchone()[0]
        connection.commit()
        connection.close()
        return result
    
    # update user based on his email
    def update_by_email(self, username, password, email):
        connection = sqlite3.connect(self.database_file)
        str_update = """UPDATE {} set {}="{}", {}={} WHERE {}=={}""".format(self.table_name, self.username, username, self.password, password, self.email, email)
        connection.execute(str_update)
        connection.commit()
        connection.close()
    
    # get user password by his email
    def get_user_password(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select_password = """SELECT {} FROM {} WHERE {}=?""".format(self.password, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select_password, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # change user password by his id
    def change_user_password_by_user_id(self, user_id, new_password):
        connection = sqlite3.connect(self.database_file)
        str_change_user_password = """UPDATE {} SET {}=? WHERE {}=?""".format(self.table_name, self.password, self.user_id)
        cursor = connection.cursor()
        new_password = "b'" + new_password.decode('utf-8') + "'"
        cursor.execute(str_change_user_password, (new_password, user_id,))
        connection.commit()
        connection.close()
    
    # get the id of a user by his email
    def get_user_id_by_email(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select_user_id = """SELECT {} FROM {} WHERE {}=?""".format(self.user_id, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select_user_id, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # get the count of user by his email
    def get_count_by_email(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select_count = """SELECT {} FROM {} WHERE {}=?""".format(self.count, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select_count, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result

    # get user type by his email
    def get_user_type_by_email(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select_user_type = """SELECT {} FROM {} WHERE {}=?""".format(self.user_type, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select_user_type, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # get username of user by his email
    def get_username_by_email(self, email):
        connection = sqlite3.connect(self.database_file)
        str_select_username = """SELECT {} FROM {} WHERE {}=?""".format(self.username, self.table_name, self.email)
        cursor = connection.cursor()
        cursor.execute(str_select_username, (email,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # get email of user by his username
    def get_email_by_username(self, username):
        connection = sqlite3.connect(self.database_file)
        str_select_email = """SELECT {} FROM {} WHERE {}=?""".format(self.email, self.table_name, self.username)
        cursor = connection.cursor()
        cursor.execute(str_select_email, (username,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # set count of user by his id
    def set_count_by_id(self, id, count):
        connection = sqlite3.connect(self.database_file)
        str_set_count = """UPDATE {} SET {}=? WHERE {}=?""".format(self.table_name, self.count, self.user_id)
        cursor = connection.cursor()
        cursor.execute(str_set_count, (count, id,))
        connection.commit()
        connection.close()
    
    # check password of user based on his email
    def check_user_password(self, email, password):
        connection = sqlite3.connect(self.database_file)
        str_check = """SELECT * FROM {} WHERE {}=? AND {}=?""".format(self.table_name, self.email, self.password)
        cursor = connection.cursor()
        cursor.execute(str_check, (email, password,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        if result:
            return True
        else:
            return False

    # get all user's details by his id
    def get_all_by_id(self, id):
        connection = sqlite3.connect(self.database_file)
        str_select_count = """SELECT * FROM {} WHERE {}=?""".format(self.table_name, self.user_id)
        cursor = connection.cursor()
        cursor.execute(str_select_count, (id,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result

    # get reset link of user by his id
    def get_reset_link_by_id(self, id):
        connection = sqlite3.connect(self.database_file)
        str_get_reset_link = """SELECT {} FROM {} WHERE {}=?""".format(self.reset_link, self.table_name, self.user_id)
        cursor = connection.cursor()
        cursor.execute(str_get_reset_link, (id,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result

    # update reset link of user by his id 
    def update_reset_link_by_id(self, id, reset_link):
        connection = sqlite3.connect(self.database_file)
        str_set_reset_link = """UPDATE {} SET {}=? WHERE {}=?""".format(self.table_name, self.reset_link, self.user_id)
        cursor = connection.cursor()
        cursor.execute(str_set_reset_link, (reset_link, id,))
        connection.commit()
        connection.close()

    # type - 1 = admin, 0 = regular user
    def check_if_admin(self, id):
        connection = sqlite3.connect(self.database_file)
        str_select_admins = """SELECT * FROM {} WHERE {}=? AND {}=1""".format(self.table_name, self.user_id, self.user_type)
        cursor = connection.cursor()
        cursor.execute(str_select_admins, (id,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        if result:
            return True
        else:
            return False


class questTable(SqlTable):
    def __init__(self, database_file, table_name, quest_id, quest, clue, answer, image_name):
        SqlTable.__init__(self, database_file, table_name)
        self.quest_id = quest_id
        self.quest = quest
        self.clue = clue
        self.answer = answer
        self.image_name = image_name
        connection = sqlite3.connect(self.database_file)
        c = connection.cursor()
        string = """CREATE TABLE IF NOT EXISTS {}({} INTEGER PRIMARY KEY AUTOINCREMENT, {} TEXT NOT NULL, {} TEXT NOT NULL, {} TEXT, {} TEXT);""".format(self.table_name, self.quest_id, self.quest, self.clue, self.answer, self.image_name)
        c.execute(string)
        connection.commit()
        connection.close()
    
    # insert a new quest to the database
    def insert_question(self, quest, clue, answer, image_name):
        connection = sqlite3.connect(self.database_file)
        str_insert = """INSERT INTO {}({}, {}, {}, {}) VALUES ("{}\", "{}\", "{}\", "{}\")""".format(self.table_name, self.quest, self.clue, self.answer, self.image_name, quest, clue, answer, image_name)
        connection.execute(str_insert)
        connection.commit()
        connection.close()
    
    # get quest's details by its id
    def get_quest_by_id(self, id):
        connection = sqlite3.connect(self.database_file)
        str_select_count = """SELECT * FROM {} WHERE {}=?""".format(self.table_name, self.quest_id)
        cursor = connection.cursor()
        cursor.execute(str_select_count, (id,))
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
    
    # get the max id of quests table
    def get_max_id(self):
        connection = sqlite3.connect(self.database_file)
        str_select = """SELECT MAX({}) FROM {}""".format(self.quest_id, self.table_name)
        cursor = connection.cursor()
        cursor.execute(str_select)
        result = cursor.fetchone()
        connection.commit()
        connection.close()
        return result
