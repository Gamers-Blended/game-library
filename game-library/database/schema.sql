-- Table for base game information
CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_text VARCHAR(255) NOT NULL
);

-- Table for game releases (combinations of platform/region/edition)
CREATE TABLE game_releases (
    release_id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(game_id),
    platform VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    edition VARCHAR(50) NOT NULL,
    cover_text TEXT,
    cover_width DECIMAL(10,2),
    cover_height DECIMAL(10,2),
    included_items JSONB,  -- Stores array of items included in this edition
    release_date DATE,
    UNIQUE(game_id, platform, region, edition)
);

-- Indexes for common query patterns
CREATE INDEX idx_game_releases_game_id ON game_releases(game_id);
CREATE INDEX idx_game_releases_platform ON game_releases(platform);
CREATE INDEX idx_game_releases_region ON game_releases(region);
CREATE INDEX idx_game_releases_edition ON game_releases(edition);

INSERT INTO games (title, title_text) VALUES ('fallout4', 'Fallout 4');
INSERT INTO games (title, title_text) VALUES ('mafia_de', 'Mafia: Definitive Edition');
INSERT INTO games (title, title_text) VALUES ('wolfenstein_young_blood', 'Wolfenstein: Youngblood');
INSERT INTO games (title, title_text) VALUES ('atelier_lulua_the_scion_of_arland', 'Atelier Lulua: Scion of Arland');


-- Insert different releases
INSERT INTO game_releases (game_id, platform, region, edition, cover_text, cover_width, cover_height, included_items, release_date) VALUES 
(1, 'ps4', 'us', 'std', 'FALLOUT 4 <br>
<br>
Welcome Home <br>
Bethesda Game Studios, the award winning creators of <b>Fallout 3</b> and <b>Skyrim</b>, <br>
welcome you to their most ambitious game ever, and the next generation of open-world gaming. <br>
<br>
As the sole survivor of Vault 111, you enter a world destroyed by nuclear war. Every second is a fight <br>
for survival, and every choice is yours. Only you can rebuild and determine the fate of the Wasteland. <br>
<br>
<b>FREEDOM & LIBERTY</b>
<br>
Do whatever you want in a massive open world with hundreds of locations.
<br>
<br>
<b>COLLECT & BUILD</b>
<br>
Collect, upgrade, and build thousands of items in the most advanced crafting system ever.
<br>
<br>
<b>YOU''RE S.P.E.C.I.A.L.</b>
<br>
Be whoever you want. Choose from hundreds of Perks and develop your own playstyle.
<br>
<br>

--***--

Test reverse cover', 1065, 631, '{"items": []}', '2015-11-10');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(2, 'ps4', 'us', 'std', '{"items": []}');

INSERT INTO game_releases (game_id, platform, region, edition, cover_text, cover_width, cover_height, included_items, release_date) VALUES 
(3, 'ps4', 'asia', 'std', 'WOLFENSTEIN: YOUNGBLOOD <br>
<br>
Wolves Hunt Together <br>
Team up with a friend or play solo with an AI companion to take on the Nazis in this brand new co-op adventure. <br>
Play as one of BJ Blazkowicz''s twin daughters and undertake a do-or-die mission to find their missing father in 1980s Paris. <br>
Wield an arsenal of new weapons, gadgets, and power armour abilities in a fight to kick Nazis out of the city of lights. <br>
', 1065, 631, '[{"item": "manual", "page_width": 1.28, "page_height": 1.71, "number_of_pages": 4}]', '2019-07-26');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(4, 'ps4', 'eur', 'std', '[{"item": "manual", "page_width": 1.28, "page_height": 1.71, "number_of_pages": 4}]');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(4, 'xboxone', 'us', 'std', '{"items": ["Manual"]}');
