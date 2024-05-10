from sql_control import questTable
import os
import json
import random
import sys

def main():
    try:
        quest_id = json.loads(sys.argv[1])
        # quest_id ==> { quest_id: "quest_id" }
        quest_table = questTable(os.path.join('./', 'database.db'), "quests", "quest_id", "quest", "clue", "answer", "imageName")
        quest_details = []
        if quest_id > 0:
            quest = quest_table.get_quest_by_id(quest_id)
            for detail in quest:
                quest_details.append(detail)
            print(quest_details)
        else:
            quests_max = quest_table.get_max_id()[0]
            random_quest_id = random.randint(1, quests_max)
            quest = quest_table.get_quest_by_id(random_quest_id)
            for detail in quest:
                quest_details.append(detail)
            print(quest_details)
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
