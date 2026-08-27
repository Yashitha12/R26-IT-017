
import requests
import os
import time

url = "https://github.com/ollama/ollama/releases/download/v0.33.0/ollama-windows-amd64.zip"
filename = "ollama.zip"

headers = {}
if os.path.exists(filename):
    downloaded_bytes = os.path.getsize(filename)
    headers["Range"] = f"bytes={downloaded_bytes}-"
else:
    downloaded_bytes = 0

print(f"Starting download from {downloaded_bytes} bytes...")

while True:
    try:
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        if response.status_code in (200, 206):
            total_size = int(response.headers.get("content-length", 0)) + downloaded_bytes
            print(f"Total size: {total_size / (1024*1024):.2f} MB")
            
            with open(filename, "ab") as f:
                for chunk in response.iter_content(chunk_size=1024*1024):
                    if chunk:
                        f.write(chunk)
                        downloaded_bytes += len(chunk)
                        print(f"Downloaded {downloaded_bytes / (1024*1024):.2f} MB / {total_size / (1024*1024):.2f} MB", end="\r")
            
            if downloaded_bytes >= total_size:
                print("\nDownload complete!")
                break
        elif response.status_code == 416:
            print("\nDownload already complete!")
            break
        else:
            print(f"\nUnexpected status code: {response.status_code}")
            break
    except Exception as e:
        print(f"\nError: {e}. Retrying in 5 seconds...")
        time.sleep(5)
        headers["Range"] = f"bytes={downloaded_bytes}-"

