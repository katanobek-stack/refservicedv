from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
import json, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
retired=['solar-energy.html','gps-tracker-installation.html','remote-monitoring.html']
pages=['index.html','refrigerator-repair.html','refrigerator-manufacturing.html','auto-ac-repair.html','reefer-container-repair.html','freezer-rooms.html','shock-freezing.html']
for name in pages:
 s=BeautifulSoup((root/name).read_text(),'html.parser')
 assert len(s.select('h1'))==1, name
 assert len(s.select('form#leadForm'))==1, name
 assert not s.select('input[name=phone]'),name
 assert s.select_one('textarea[name=message][required]'),name
 assert not any('assistant.js' in x.get('src','') for x in s.find_all('script')),name
 assert not any(x in s.get_text().lower() for x in ['мониторинг','gps','солнеч']),name
 ids=[e['id'] for e in s.select('[id]')]
 assert len(ids)==len(set(ids)),name
 for tag,attr in [('a','href'),('img','src'),('script','src'),('link','href')]:
  for el in s.select(f'{tag}[{attr}]'):
   target=urlsplit(el[attr]);path=unquote(target.path)
   if target.scheme or target.netloc:continue
   if path:
    assert (root/path.lstrip('/')).exists(),(name,path)
   if target.fragment:
    dest=s if not path else BeautifulSoup((root/path).read_text(),'html.parser')
    assert dest.find(id=target.fragment),(name,el[attr])
 for ld in s.select('script[type="application/ld+json"]'):json.loads(ld.string)
for name in retired:assert not (root/name).exists(),name
urls=ET.parse(root/'sitemap.xml').getroot()
assert not any(name in ET.tostring(urls).decode() for name in retired)
print('PASS: 7 pages, links, anchors, images, forms, structured data and sitemap')
