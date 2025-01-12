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
INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(1, 'ps4', 'us', 'std', '{"items": ["Manual"]}');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(1, 'switch', 'us', 'std', '{"items": ["Manual"]}');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(2, 'ps4', 'us', 'std', '{"items": []}');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(3, 'ps4', 'asia', 'std', '{"items": ["Manual"]}');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(4, 'ps4', 'eur', 'std', '{"items": ["Manual"]}');

INSERT INTO game_releases (game_id, platform, region, edition, included_items) VALUES 
(4, 'xboxone', 'us', 'std', '{"items": ["Manual"]}');
