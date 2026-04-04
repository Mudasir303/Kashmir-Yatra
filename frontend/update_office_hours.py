import os
import glob
import re

def update_office_hours(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the old office hours with the new one
    old_hours = '<span>Mon - Sun: 9:00 AM - 8:00 PM</span>'
    new_hours = '<span>Mon - Sat: 10am - 5pm. Sunday is off.</span>'
    
    if old_hours in content:
        content = content.replace(old_hours, new_hours)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    base_dir = r"c:\Users\hp\Desktop\workspace\kashmir yatra\frontend"
    html_files = glob.glob(os.path.join(base_dir, "*.html"))
    
    for html_file in html_files:
        if os.path.basename(html_file) in ["admin-dashboard.html", "admin-login.html"]:
            continue
        if update_office_hours(html_file):
            print(f"Updated office hours in: {os.path.basename(html_file)}")

if __name__ == "__main__":
    main()