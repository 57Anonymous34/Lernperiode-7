async function loadTracks(query) {
  const url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(query)}&client_id=2t9loNQH90kzJcsFCODdigxfp325aq4z`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.collection); // echte API-Antwort (Array von Tracks)
}
loadTracks("drake");







