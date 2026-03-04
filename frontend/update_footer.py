import os, glob, re

folder = r"c:\Users\hp\Desktop\workspace\kashmir yatra\frontend"
html_files = glob.glob(os.path.join(folder, "*.html"))

insert_html = """                    <!-- Column D: Services -->
                    <div class="col-xl-2 col-lg-6 col-md-6">
                        <div class="footer-widget-items">
                            <div class="widget-title">
                                <h3>Our Services</h3>
                            </div>
                            <ul class="list-items">
                                <li><a href="ticketing.html"><i class="far fa-long-arrow-right"></i> Ticketing Service</a></li>
                                <li><a href="taxi.html"><i class="far fa-long-arrow-right"></i> Taxi Service</a></li>
                                <li><a href="accommodation.html"><i class="far fa-long-arrow-right"></i> Accommodation</a></li>
                                <li><a href="pilgrimage.html"><i class="far fa-long-arrow-right"></i> Pilgrimage Tours</a></li>
                                <li><a href="unexplored.html"><i class="far fa-long-arrow-right"></i> Kashmir Unexplored</a></li>
                                <li><a href="mice.html"><i class="far fa-long-arrow-right"></i> Corporate Tours (MICE)</a></li>
                            </ul>
                        </div>
                    </div>
"""

target = "<!-- Column 4: Quick Links -->"

for file in html_files:
    if os.path.basename(file) in ["admin-dashboard.html", "admin-login.html"]:
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "<h3>Our Services</h3>" not in content and target in content:
        # Insert services column
        content = content.replace(target, insert_html + target)
        
        # Adjust Contact Info column xl size from 3 to 2 to fit everything neatly without breaking grid on some xl screens
        content = re.sub(r'(<!-- Column 5: Contact & Get Directions -->\s*<div class="col-xl-)3', r'\g<1>2', content)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(file)}")
