let chart;
let alleCoins = []; // 🔥 lokaler Cache für Coins (1× laden, dann offline filtern)

/* Kryptowährungsliste nur 1× laden */
async function ladeCoinsVonAPI() {
    if (alleCoins.length > 0) return; // schon geladen → erneut nicht nötig

    const url = `https://api.coingecko.com/api/v3/coins/markets
        ?vs_currency=usd
        &order=market_cap_desc
        &per_page=250
        &page=1`
        .replace(/\s+/g, "");

    const res = await fetch(url);
    alleCoins = await res.json();
}

/* Tabelle laden + filtern */
async function ladeTabelle() {
    await ladeCoinsVonAPI(); // API nur beim ersten Mal laden

    const eingabe = document.getElementById("coinInput").value.toLowerCase();

    const preisMin = Number(document.getElementById("filterPreisMin").value);
    const preisMax = Number(document.getElementById("filterPreisMax").value);
    const changeFilter = document.getElementById("filterChange").value;
    const sortOption = document.getElementById("sortierung").value;

    /* Ausgangsdaten */
    let daten = [...alleCoins];

    /* Suchfilter */
    if (eingabe !== "") {
        daten = daten.filter(c =>
            c.id.includes(eingabe) ||
            c.name.toLowerCase().includes(eingabe) ||
            c.symbol.toLowerCase().includes(eingabe)
        );
    }

    /* Preisfilter */
    if (preisMin) daten = daten.filter(c => c.current_price >= preisMin);
    if (preisMax) daten = daten.filter(c => c.current_price <= preisMax);

    /* 24h Änderung */
    if (changeFilter === "pos") daten = daten.filter(c => c.price_change_percentage_24h > 0);
    if (changeFilter === "neg") daten = daten.filter(c => c.price_change_percentage_24h < 0);

    /* Sortierung */
    if (sortOption === "price_desc") daten.sort((a, b) => b.current_price - a.current_price);
    if (sortOption === "price_asc") daten.sort((a, b) => a.current_price - b.current_price);
    if (sortOption === "market_desc") daten.sort((a, b) => b.market_cap - a.market_cap);
    if (sortOption === "market_asc") daten.sort((a, b) => a.market_cap - b.market_cap);

    /* Tabelle aktualisieren */
    const tableBody = document.querySelector("#cryptoTable tbody");
    tableBody.innerHTML = "";

    if (daten.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4'>Keine Ergebnisse</td></tr>";
        return;
    }

    daten.forEach(coin => {
        const row = document.createElement("tr");
        const changeClass = coin.price_change_percentage_24h >= 0 ? "positive" : "negative";

        row.innerHTML = `
            <td><img src="${coin.image}" width="20"> ${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
        `;

        row.onclick = () => {
            document.getElementById("coinInput").value = coin.id;
            ladeDiagramm(365);
            window.scrollTo({ top: 600, behavior: "smooth" });
        };

        tableBody.appendChild(row);
    });
}

/* Diagramm laden – bleibt API-basiert (korrekt) */
function ladeDiagramm(days) {
    const coin = document.getElementById("coinInput").value.toLowerCase();
    if (!coin) return alert("Bitte einen Coin eingeben!");

    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart
        ?vs_currency=usd
        &days=${days}`
        .replace(/\s+/g, "");

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const prices = data.prices;
            if (!prices) return;

            const labels = prices.map(p => new Date(p[0]).toLocaleDateString());
            const values = prices.map(p => p[1]);

            if (chart) chart.destroy();

            const ctx = document.getElementById("chart").getContext("2d");

            chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels,
                    datasets: [{
                        label: `${coin.toUpperCase()} Preisverlauf`,
                        data: values,
                        borderColor: "#000",
                        backgroundColor: "rgba(0,0,0,0.06)",
                        borderWidth: 3,
                        tension: 0.3,
                        pointRadius: 0,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    interaction: { mode: "index", intersect: false },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                title: ctx => "Datum: " + ctx[0].label,
                                label: ctx => "Preis: $" + ctx.parsed.y.toLocaleString()
                            }
                        }
                    }
                }
            });
        });
}

/* Live-Suche nutzt jetzt auch den lokalen Cache */
async function eingabeGeändert() {
    await ladeCoinsVonAPI(); // lädt nur beim ersten Mal

    const wert = document.getElementById("coinInput").value.trim().toLowerCase();
    const dropdown = document.getElementById("searchResults");
    dropdown.innerHTML = "";

    if (wert.length < 2) return;

    const treffer = alleCoins.filter(c =>
        c.name.toLowerCase().includes(wert) ||
        c.symbol.toLowerCase().includes(wert)
    );

    treffer.slice(0, 10).forEach(c => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.innerHTML = `
            <img src="${c.image}" width="20" style="margin-right:8px;">
            ${c.name} (${c.symbol.toUpperCase()})
        `;
        div.onclick = () => {
            document.getElementById("coinInput").value = c.id;
            dropdown.innerHTML = "";
            ladeDiagramm(365);
            ladeTabelle();
        };
        dropdown.appendChild(div);
    });
}

window.onload = () => {
    ladeTabelle();
};
