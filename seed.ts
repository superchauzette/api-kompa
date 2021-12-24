import { readdir, writeFile } from "fs/promises";
import NodeID3 from "node-id3";
import slug from "slug";

const path = "./api/kompa";

const excludeFile = (f: string) => ![".DS_Store"].includes(f);

async function main() {
  try {
    const artistsData = [];
    const albumsData = [];

    const artists = await readdir(path);
    for (const artist of artists.filter(excludeFile)) {
      artistsData.push({ name: artist, slug: slug(artist) });

      const albums = await readdir(path + "/" + artist);
      for (const album of albums.filter(excludeFile)) {
        let albumData = {
          name: album,
          slugArtist: slug(artist),
          slugAlbum: slug(album),
          artist,
          url: "",
          tracks: [] as any[],
        };
        const tracks = await readdir(path + "/" + artist + "/" + album);
        for (const track of tracks.filter(excludeFile)) {
          if (track.includes(".mp3")) {
            const tag = await NodeID3.Promise.read(path + "/" + artist + "/" + album + "/" + track);

            albumData.tracks.push({
              url: "/kompa/" + artist + "/" + album + "/" + track,
              title: tag.title,
              artist: tag.artist,
              trackNumber: Number(tag.trackNumber),
              composer: tag.composer,
              genre: tag.genre,
              album: tag.album,
            });
          }
          if (track.includes(".jpg")) {
            albumData.url = "/kompa/" + artist + "/" + album + "/" + track;
          }
        }
        albumsData.push(albumData);
      }
    }

    await writeFile("./api/artists.json", JSON.stringify(artistsData, null, 2));
    await writeFile("./api/albums.json", JSON.stringify(albumsData, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
