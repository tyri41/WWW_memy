DROP TABLE IF EXISTS Memes;
DROP TABLE IF EXISTS Changes;

CREATE TABLE Memes (
	id INTEGER NOT NULL,
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	price TEXT NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE Changes (
	id INTEGER NOT NULL,
	name TEXT NOT NULL,
	memeId TEXT NOT NULL,
	price TEXT NOT NULL,
	PRIMARY KEY (id)
);

INSERT INTO Memes (name, price, url)
VALUES
    ('Gold', 1000, 'https://i.redd.it/h7rplf9jt8y21.png'),
    ('Elite', 1200, 'https://i.imgflip.com/30zz5g.jpg'),
    ('alfa', 1112, 'https://i.redd.it/0le89kvmh1451.jpg'),
    ('beta', 1144, 'https://i.redd.it/0bzn1kn1b0451.jpg'),
    ('dzeta', 2250, 'https://i.redd.it/m7smk6rtp0451.png');