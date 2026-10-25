from pathlib import Path
from urllib.parse import urlsplit, unquote
from bs4 import BeautifulSoup
import json, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
retired=['solar-energy.html']
pages=['index.html','refrigerator-repair.html','refrigerator-manufacturing.html','auto-ac-repair.html','reefer-container-repair.html','freezer-rooms.html','shock-freezing.html','remote-monitoring.html']
for name in pages:
 s=BeautifulSoup((root/name).read_text(),'html.parser')
 assert len(s.select('h1'))==1, name
 assert len(s.select('form#leadForm'))==1, name
 assert not s.select('input[name=phone]'),name
 assert s.select_one('textarea[name=message][required]'),name
 assert not any('assistant.js' in x.get('src','') for x in s.find_all('script')),name
 assert 'солнеч' not in s.get_text().lower(),name
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
index=BeautifulSoup((root/'index.html').read_text(),'html.parser')
assert len(index.select('.services-grid .service-card')) == 7
assert len(index.select('#services a[href="remote-monitoring.html"]')) == 1
assert not index.select('.hero a[href="remote-monitoring.html"], .hero a[href="gps-tracker-installation.html"]')
sitemap_locations={e.text for e in urls.findall('{*}url/{*}loc')}
assert 'https://refservicedv.ru/remote-monitoring.html' in sitemap_locations
assert 'https://refservicedv.ru/gps-tracker-installation.html' not in sitemap_locations
assert 'Sitemap: https://refservicedv.ru/sitemap.xml' in (root/'robots.txt').read_text()
for url in sitemap_locations:
 path=urlsplit(url).path.lstrip('/') or 'index.html'
 assert (root/path).exists(),url
redirect=BeautifulSoup((root/'gps-tracker-installation.html').read_text(),'html.parser')
assert 'remote-monitoring.html' in redirect.select_one('meta[http-equiv="refresh"]')['content']
assert 'noindex' in redirect.select_one('meta[name=robots]')['content']
html_map=BeautifulSoup((root/'sitemap.html').read_text(),'html.parser')
assert html_map.select_one('a[href="remote-monitoring.html"]')
print('PASS: 8 commercial pages, 7 catalog cards, lower-only monitoring link, XML/HTML sitemaps and legacy GPS redirect')
