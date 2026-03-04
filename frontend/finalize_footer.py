import os
import glob
import re

def update_footer(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the new merged column
    merged_column = """                    <!-- Column 2: Top Tours & Destinations -->
                    <div class="col-xl-3 col-lg-6 col-md-6">
                        <div class="footer-widget-items">
                            <div class="widget-title">
                                <h3>Top Tours & Destinations</h3>
                            </div>
                            <ul class="list-items">
                                <li><a href="tour-domestic.html"><i class="far fa-long-arrow-right"></i> Domestic Packages</a></li>
                                <li><a href="tour-international.html"><i class="far fa-long-arrow-right"></i> International Packages</a></li>
                                <li><a href="tour.html"><i class="far fa-long-arrow-right"></i> Srinagar Packages</a></li>
                                <li><a href="tour.html"><i class="far fa-long-arrow-right"></i> Gulmarg Ski Tours</a></li>
                                <li><a href="tour.html"><i class="far fa-long-arrow-right"></i> Pahalgam Getaways</a></li>
                                <li><a href="destination-domestic.html"><i class="far fa-long-arrow-right"></i> Domestic Destinations</a></li>
                                <li><a href="destination-international.html"><i class="far fa-long-arrow-right"></i> International Destinations</a></li>
                            </ul>
                        </div>
                    </div>"""

    # Define the services column
    services_column = """                    <!-- Column 3: Our Services -->
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
                    </div>"""

    # Define the quick links column (xl-2)
    quick_links_column = """                    <!-- Column 4: Quick Links -->
                    <div class="col-xl-2 col-lg-6 col-md-6">
                        <div class="footer-widget-items">
                            <div class="widget-title">
                                <h3>Quick Links</h3>
                            </div>
                            <ul class="list-items">
                                <li><a href="index.html"><i class="far fa-long-arrow-right"></i> Home</a></li>
                                <li><a href="about.html"><i class="far fa-long-arrow-right"></i> About Us</a></li>
                                <li><a href="tour.html"><i class="far fa-long-arrow-right"></i> All Tours</a></li>
                                <li><a href="destination.html"><i class="far fa-long-arrow-right"></i> Destinations</a></li>
                                <li><a href="news.html"><i class="far fa-long-arrow-right"></i> Blogs</a></li>
                                <li><a href="faq.html"><i class="far fa-long-arrow-right"></i> FAQs</a></li>
                                <li><a href="contact.html"><i class="far fa-long-arrow-right"></i> Contact Us</a></li>
                            </ul>
                        </div>
                    </div>"""

    # Define the contact info column (xl-2)
    contact_column_start = """                    <!-- Column 5: Contact & Get Directions -->
                    <div class="col-xl-2 col-lg-6 col-md-6">"""

    # Regex to find the entire footer row content from Column 2 to Column 5/6
    # We match from the start of Column 2 until the end of the Quick Links column
    # Then we replace it with our new structure
    
    # First, let's identify the start points
    # Column 2 starts with <!-- Column 2: Popular Tours -->
    # Column 5 starts with <!-- Column 5: Contact & Get Directions -->
    
    pattern = re.compile(r'<!-- Column 2: Popular Tours -->.*?<!-- Column 5: Contact & Get Directions -->', re.DOTALL)
    
    if pattern.search(content):
        new_middle = merged_column + "\n\n" + services_column + "\n\n" + quick_links_column + "\n\n"
        content = pattern.sub(new_middle + "<!-- Column 5: Contact & Get Directions -->", content)
        
        # Now ensure Contact Info is col-xl-2
        content = re.sub(r'<!-- Column 5: Contact & Get Directions -->\s*<div class="col-xl-\d', contact_column_start, content)
        
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
        if update_footer(html_file):
            print(f"Updated: {os.path.basename(html_file)}")
        else:
            print(f"Skipped (target not found): {os.path.basename(html_file)}")

if __name__ == "__main__":
    main()
