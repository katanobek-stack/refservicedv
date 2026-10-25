# Unified service pages

Palette and type match home: ice #EDF3F7, white #FFFFFF, ink #122635, cobalt #155EEF, muted #576C7B, line #CFDCE5; Golos Text and Unbounded. Left-aligned service pages prioritize equipment, scope and direct contact. Features use open columns and dividers. Seven services, sitemap, privacy, consent and 404 share the homepage chrome. URLs, canonical tags, content and WhatsApp behavior preserved. Monitoring remains a labeled demonstration. No testimonials, project counts or live data invented.

New built-in ImageGen service illustrations, visibly labeled, packaged as assets/services/reefer-service-illustration.webp, coldroom-illustration.webp and blast-freezing-illustration.webp. Homepage cards use the same images. Existing repair, AC and truck assets retained.

## Image prompts

### container

Use case: ads-marketing. Generate one landscape editorial photorealistic website service illustration, no text, no logos, no watermark. Full front refrigeration machinery of a white refrigerated shipping container visible at a three-quarter angle in a tidy service yard. A technician wearing cobalt blue work clothes stands to the side checking the opened refrigeration service compartment with manifold gauge hoses connected plausibly. Entire container front and recognizable long white corrugated side in frame, machinery fully visible, service work as primary subject, no crane or loading operation. Restrained ice white, steel silver, cobalt blue, natural daylight, sophisticated industrial photography, landscape 3:2, all important equipment within central 80 percent.

### coldroom

Use case: ads-marketing. Generate one landscape photorealistic architectural service illustration for a refrigeration company website. A professionally installed walk-in cold storage chamber viewed from outside through a wide open insulated door; show full door frame and a short section of exterior white sandwich panels, inside clean stainless steel shelves with a few unbranded food crates, ceiling-mounted industrial evaporator with fans fully visible and a small adjacent outdoor condensing unit visible near the exterior wall. Technically coherent installed refrigeration system, not domestic refrigerator. Bright realistic commercial food facility, white silver with restrained cobalt details, balanced perspective, no people, no text, no logos, no exaggerated frost, no watermark. Landscape 3:2, important system fully in frame.

### blast

Use case: ads-marketing. Generate one landscape photorealistic service illustration for an industrial refrigeration engineering website. A walk-in industrial blast freezing chamber with large insulated door opened, stainless steel trolley loaded with trays of uniform unbranded food portions partly inside, large industrial evaporator fan wall visible inside with unobstructed airflow. Show complete chamber opening, trolley, door and meaningful surrounding exterior, clean commercial food production environment, realistic scale, no household appliances. Cool white panels and brushed stainless steel with restrained blue details, soft neutral daylight, clear technical product architecture photography. No excessive fog, no glowing sci-fi effects, no people, no text, no logos, no watermark. Landscape 3:2, full equipment and process legible.


The monitoring homepage card now uses assets/services/monitoring-route.svg, a code-native illustration of route, temperature history and notifications instead of an unrelated SCADA screenshot. Homepage CSS cache key is bumped for returning visitors.

Validation: existing site_check.py and three contact-form Node tests pass. Browser review at desktop and a 480 CSS-pixel iframe: all seven service pages loaded without broken images, horizontal overflow or overflowing headings/forms. Menu opened and closed, Contacts reached the form. No 320/390 checks performed, respecting the owner's request.
