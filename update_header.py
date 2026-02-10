import os
import re

# Configuration
PROJECT_ROOT = r"c:\Users\hp\Desktop\workspace\kashmir yatra\frontend"
INDEX_FILE = os.path.join(PROJECT_ROOT, "index.html")
START_MARKER = "<!-- Preloader Start -->"
END_MARKER = "</header>"

def get_master_block():
    print(f"Reading master block from {INDEX_FILE}...")
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to find the block
    pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
    match = pattern.search(content)
    if not match:
        raise Exception("Could not find master block in index.html")
    
    return match.group(0)

def update_file(filepath, master_block):
    print(f"Updating {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
        if not pattern.search(content):
            print(f"WARNING: Could not find target block in {filepath}. Skipping.")
            return False
        
        new_content = pattern.sub(master_block, content)
        
        if new_content == content:
            print(f"  No changes needed for {filepath}")
            return True
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  SUCCESS: Updated {filepath}")
        return True
    except Exception as e:
        print(f"  ERROR updating {filepath}: {str(e)}")
        return False

def main():
    master_block = get_master_block()
    print(f"Master block length: {len(master_block)} chars")
    
    files_to_update = [
        "about.html",
        "contact.html",
        "tour.html",
        "404.html",
        "checkout.html",
        "faq.html",
        "destination-details.html",
        "destination.html",
        "destination-page-2.html",
        "destination-page-3.html",
        "index-2.html",
        "index-3.html",
        "news-details.html",
        "news.html",
        "shop-cart.html",
        "shop-details.html",
        "shop.html",
        "team-details.html",
        "team.html",
        "tour-2.html",
        "tour-details.html",
        "tour-list.html"
    ]
    
    for filename in files_to_update:
        filepath = os.path.join(PROJECT_ROOT, filename)
        if os.path.exists(filepath):
            update_file(filepath, master_block)
        else:
            print(f"WARNING: File not found: {filepath}")

if __name__ == "__main__":
    main()
