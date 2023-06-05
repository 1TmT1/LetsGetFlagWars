import sys
import json
from sql_control import questTable
import os

def main():
    try:
        details = json.loads(sys.argv[1])

        quests_table = questTable(os.path.join('./', 'database.db'), 'quests', 'quest_id', 'quest', 'clue', 'answer', 'imageName')

        # quest => (quest_id, quest, clue, answer, image_name)
        quest = quests_table.get_quest_by_id(details["quest_id"])
        quest_answer = f"lgcw{{{quest[3]}}}" 
        if quest_answer == details["answer"]:
            print("true")
        else:
            print("false")
    except:
        print("false")

# runs the main function
if __name__ == "__main__":
    main()
