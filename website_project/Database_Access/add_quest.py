import sys
import json
from sql_control import questTable
import os


def main():
    try:
        details = json.loads(sys.argv[1])
        # details ==> { imageName: "imageName", quest: "quest", clue: "clue", answer: "answer" }
        quests_table = questTable(os.path.join('./', 'database.db'), 'quests', 'quest_id', 'quest', 'clue', 'answer', 'imageName')
        if "imageName" in details:
            quests_table.insert_question(details["quest"], details["clue"], details["answer"], details["imageName"])
        else:
            quests_table.insert_question(details["quest"], details["clue"], details["answer"], "1")
        print("true")
    except:
        print("false")


# runs the main function
if __name__ == "__main__":
    main()
