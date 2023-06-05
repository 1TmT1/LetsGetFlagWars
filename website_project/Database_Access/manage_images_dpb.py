import dropbox
import json
import sys
import os
import base64

def main():
    try:
        # file_json = { "fileName": "req.body.fileName", "imageFile": "req.body.imageFile" }
        # print(file_json.name)
        details = json.loads(sys.argv[1])
        # details ==> { dpbSec: "dpb_secret", operation: "operation", imageName: "imageName" }
        dbx = dropbox.Dropbox(details["dpbSec"])

        file_location = "/letgetcodewars/" + details["imageName"]
        if details["operation"] == "upload":
            file = os.path.join(os.getcwd(), 'images/image.jpg')
            upload_file(dbx, file_location, file)
            print("true")
        elif details["operation"] == "read":
            # file = os.path.join(os.getcwd(), 'images/quest_image.jpg')
            print("true, " + str(base64.b64encode(read_file(dbx, file_location))))
    except:
        print("false")


def upload_file(dbx, file_location, file):
    with open(file, "rb") as f:
        dbx.files_upload(f.read(), file_location, mode=dropbox.files.WriteMode.overwrite)


def read_file(dbx, file_location):
    _, f = dbx.files_download(file_location) # _(metadata), res
    return f.content
    # file_content = f.content
    # with open(file, 'wb') as f:
    #     f.write(file_content)


# runs the main function
if __name__ == "__main__":
    main()
